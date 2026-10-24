'use server';

import crypto from 'node:crypto';
import {
  BookingStatus,
  DepositStatus,
  PaymentMethod,
  Prisma,
  ReviewModerationStatus,
} from '@prisma/client';
import { z } from 'zod';
import { isDatabaseReachableFast, prisma } from '@/lib/prisma';
import {
  buildDakarDateTime,
  verifySlotAvailability,
  resolveFullWeeklySchedules,
} from '@/lib/slot-engine';
import {
  buildBookingConfirmedWhatsAppUrl,
  buildDepositProofWhatsAppUrl,
  buildReviewRequestWhatsAppUrl,
  normalizeSenegalPhone,
} from '@/lib/whatsapp';
import {
  ActionResult,
  verifyAdminPinOrThrow,
} from '@/actions/availability.actions';

const createBookingSchema = z
  .object({
    serviceId: z.string().min(1),
    dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date invalide.'),
    startTimeLabel: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Heure invalide.'),
    clientName: z
      .string()
      .trim()
      .min(2, 'Merci d’indiquer ton prénom et nom.')
      .max(80),
    clientPhone: z
      .string()
      .trim()
      .min(9, 'Numéro de téléphone requis.')
      .max(20),
    clientInstagram: z
      .string()
      .trim()
      .max(60)
      .optional()
      .transform((val) => (val && val.length > 0 ? val : undefined)),
    clientNotes: z
      .string()
      .trim()
      .max(500)
      .optional()
      .transform((val) => (val && val.length > 0 ? val : undefined)),
    paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.WAVE),
    agreedToRules: z.literal(true, {
      errorMap: () => ({
        message: 'Tu dois accepter les conditions du rendez-vous.',
      }),
    }),
  })
  .strict();

export interface LockedBookingCreatedDTO {
  bookingId: string;
  referenceCode: string;
  serviceName: string;
  dateKey: string;
  startTimeLabel: string;
  endTimeLabel: string;
  totalPriceXof: number;
  depositAmountXof: number;
  remainingAmountXof: number;
  paymentMethod: PaymentMethod;
  lockedUntilIso: string;
  wavePhone: string;
  orangeMoneyPhone: string;
  whatsappDepositProofUrl: string;
}

function generateReferenceCode(): string {
  const randomDigits = crypto.randomInt(1000, 9999);
  return `TEB-${randomDigits}`;
}

/**
 * Étape 4 -> Étape 5 : Crée la réservation et verrouille immédiatement le créneau en transaction Serializable
 * pour empêcher tout doublon pendant que la cliente règle son acompte Wave / Orange Money.
 */
export async function createBookingAndLockSlotAction(
  rawInput: z.infer<typeof createBookingSchema>
): Promise<ActionResult<LockedBookingCreatedDTO>> {
  try {
    const input = createBookingSchema.parse(rawInput);
    const normalizedPhone = normalizeSenegalPhone(input.clientPhone);
    if (!(await isDatabaseReachableFast())) {
      return {
        success: false,
        error: "Can't reach database server (mode local actif).",
      };
    }
    const now = new Date();
    const maxRetries = 3;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
      try {
        const result = await prisma.$transaction(
          async (tx) => {
        // 1. Expirer automatiquement les anciens verrous d'acompte dépassés
        await tx.booking.updateMany({
          where: {
            status: BookingStatus.PENDING_DEPOSIT,
            lockedUntil: { lte: now },
          },
          data: {
            status: BookingStatus.EXPIRED,
            lockedUntil: null,
          },
        });

        const [settings, service, weeklySchedules] = await Promise.all([
          tx.studioSettings.upsert({
            where: { id: 'default' },
            update: {},
            create: { id: 'default' },
          }),
          tx.service.findFirst({
            where: { id: input.serviceId, isActive: true },
          }),
          tx.weeklySchedule.findMany({
            where: { isActive: true },
            take: 50,
          }),
        ]);

        if (!service) {
          throw new Error('Cette prestation est introuvable ou indisponible.');
        }

        if (settings.examModeActive) {
          throw new Error(
            settings.examModeMessage ??
              'Les réservations sont temporairement fermées pour période d’examens.'
          );
        }

        const dayStartUtc = buildDakarDateTime(input.dateKey, 0);
        const dayEndUtc = buildDakarDateTime(input.dateKey, 24 * 60);

        const [blackoutPeriods, existingBookings] = await Promise.all([
          tx.blackoutPeriod.findMany({
            where: {
              startAt: { lt: dayEndUtc },
              endAt: { gt: dayStartUtc },
            },
            take: 50,
          }),
          tx.booking.findMany({
            where: {
              startAt: { lt: dayEndUtc },
              bufferEndAt: { gt: dayStartUtc },
              status: {
                in: [
                  BookingStatus.PENDING_DEPOSIT,
                  BookingStatus.CONFIRMED,
                  BookingStatus.COMPLETED,
                ],
              },
            },
            select: {
              id: true,
              status: true,
              startAt: true,
              endAt: true,
              bufferEndAt: true,
              lockedUntil: true,
            },
            take: 50,
          }),
        ]);

        // 2. Re-vérification mathématique stricte du créneau dans la transaction
        const verifiedSlot = verifySlotAvailability({
          dateKey: input.dateKey,
          startTimeLabel: input.startTimeLabel,
          service: {
            id: service.id,
            name: service.name,
            durationMinutes: service.durationMinutes,
            bufferMinutes: service.bufferMinutes,
            priceXof: service.priceXof,
            depositXof: service.depositXof,
          },
          settings: {
            minNoticeHours: settings.minNoticeHours,
            defaultBufferMinutes: settings.defaultBufferMinutes,
            slotHoldMinutes: settings.slotHoldMinutes,
            maxAdvanceDays: settings.maxAdvanceDays,
            slotIntervalMinutes: settings.slotIntervalMinutes,
            examModeActive: settings.examModeActive,
            examModeMessage: settings.examModeMessage,
          },
          weeklySchedules: resolveFullWeeklySchedules(weeklySchedules),
          blackoutPeriods,
          existingBookings,
          now,
        });

        if (!verifiedSlot) {
          throw new Error(
            'Ce créneau vient tout juste d’être réservé ou n’est plus disponible. Choisis une autre heure.'
          );
        }

        // 3. Génération d'une référence unique TEB-XXXX
        let referenceCode = generateReferenceCode();
        for (let attempt = 0; attempt < 5; attempt += 1) {
          const existingRef = await tx.booking.findUnique({
            where: { referenceCode },
            select: { id: true },
          });
          if (!existingRef) break;
          referenceCode = generateReferenceCode();
        }

        const lockedUntil = new Date(
          now.getTime() + settings.slotHoldMinutes * 60_000
        );

        const effectivePriceXof =
          settings.promoModeActive &&
          service.category === 'FULL_SET' &&
          Boolean(settings.promoPriceXof)
            ? (settings.promoPriceXof ?? service.priceXof)
            : service.priceXof;

        const createdBooking = await tx.booking.create({
          data: {
            referenceCode,
            serviceId: service.id,
            clientName: input.clientName,
            clientPhone: normalizedPhone,
            clientInstagram: input.clientInstagram ?? null,
            clientNotes: input.clientNotes ?? null,
            agreedToRules: input.agreedToRules,
            dateKey: verifiedSlot.dateKey,
            startTimeLabel: verifiedSlot.startTimeLabel,
            endTimeLabel: verifiedSlot.endTimeLabel,
            startAt: new Date(verifiedSlot.startAtIso),
            endAt: new Date(verifiedSlot.endAtIso),
            bufferEndAt: new Date(verifiedSlot.bufferEndAtIso),
            totalPriceXof: effectivePriceXof,
            depositAmountXof: service.depositXof,
            paymentMethod: input.paymentMethod,
            depositStatus: DepositStatus.PENDING,
            status: BookingStatus.PENDING_DEPOSIT,
            lockedUntil,
          },
        });

        const whatsappDepositProofUrl = buildDepositProofWhatsAppUrl({
          studioWhatsappPhone: settings.whatsappPhone,
          referenceCode: createdBooking.referenceCode,
          clientName: createdBooking.clientName,
          serviceName: service.name,
          dateKey: createdBooking.dateKey,
          startTimeLabel: createdBooking.startTimeLabel,
          depositAmountXof: createdBooking.depositAmountXof,
          totalPriceXof: createdBooking.totalPriceXof,
          paymentMethod: createdBooking.paymentMethod,
        });

        return {
          bookingId: createdBooking.id,
          referenceCode: createdBooking.referenceCode,
          serviceName: service.name,
          dateKey: createdBooking.dateKey,
          startTimeLabel: createdBooking.startTimeLabel,
          endTimeLabel: createdBooking.endTimeLabel,
          totalPriceXof: createdBooking.totalPriceXof,
          depositAmountXof: createdBooking.depositAmountXof,
          remainingAmountXof:
            createdBooking.totalPriceXof - createdBooking.depositAmountXof,
          paymentMethod: createdBooking.paymentMethod,
          lockedUntilIso: lockedUntil.toISOString(),
          wavePhone: settings.wavePhone,
          orangeMoneyPhone: settings.orangeMoneyPhone,
          whatsappDepositProofUrl,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );

        return { success: true, data: result };
      } catch (err: unknown) {
        lastError = err;
        const isConflict =
          (err && typeof err === 'object' && 'code' in err && (err as { code: string }).code === 'P2034') ||
          (err instanceof Error &&
            (err.message.includes('write conflict') ||
              err.message.includes('deadlock') ||
              err.message.includes('serialization failure')));

        if (isConflict && attempt < maxRetries) {
          const delay = attempt * 80 + Math.floor(Math.random() * 60);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        throw err;
      }
    }

    throw lastError;
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Erreur lors du verrouillage du créneau.';
    return { success: false, error: message };
  }
}

const submitProofSchema = z
  .object({
    bookingId: z.string().min(1),
    referenceCode: z.string().min(1),
    paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  })
  .strict();

/**
 * Étape 5 -> Étape 6 : Marque que la cliente a cliqué sur l'envoi de preuve WhatsApp
 * et prolonge le verrou temporaire pour laisser le temps à la praticienne de valider l'acompte.
 */
export async function markDepositSubmittedWhatsappAction(
  rawInput: z.infer<typeof submitProofSchema>
): Promise<
  ActionResult<{
    bookingId: string;
    referenceCode: string;
    depositStatus: DepositStatus;
    whatsappDepositProofUrl: string;
  }>
> {
  try {
    const input = submitProofSchema.parse(rawInput);
    if (!(await isDatabaseReachableFast())) {
      return {
        success: false,
        error: 'Base de données hors-ligne (mode local actif).',
      };
    }
    const now = new Date();

    const booking = await prisma.booking.findFirst({
      where: {
        id: input.bookingId,
        referenceCode: input.referenceCode,
      },
      include: { service: true },
    });

    if (!booking) {
      return { success: false, error: 'Réservation introuvable.' };
    }

    if (
      booking.status === BookingStatus.CANCELLED ||
      booking.status === BookingStatus.EXPIRED
    ) {
      return {
        success: false,
        error: 'Ce créneau a expiré ou a été annulé.',
      };
    }

    const settings = await prisma.studioSettings.upsert({
      where: { id: 'default' },
      update: {},
      create: { id: 'default' },
    });

    // Prolonge le verrou de 2h après clic sur "Envoyer la preuve sur WhatsApp" pour sécuriser la validation
    const extendedLock = new Date(now.getTime() + 120 * 60_000);
    const updatedMethod = input.paymentMethod ?? booking.paymentMethod;

    const updated = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        paymentMethod: updatedMethod,
        depositStatus:
          booking.depositStatus === DepositStatus.CONFIRMED
            ? DepositStatus.CONFIRMED
            : DepositStatus.SUBMITTED_WHATSAPP,
        lockedUntil:
          booking.status === BookingStatus.PENDING_DEPOSIT
            ? extendedLock
            : null,
      },
    });

    const whatsappDepositProofUrl = buildDepositProofWhatsAppUrl({
      studioWhatsappPhone: settings.whatsappPhone,
      referenceCode: updated.referenceCode,
      clientName: updated.clientName,
      serviceName: booking.service.name,
      dateKey: updated.dateKey,
      startTimeLabel: updated.startTimeLabel,
      depositAmountXof: updated.depositAmountXof,
      totalPriceXof: updated.totalPriceXof,
      paymentMethod: updated.paymentMethod,
    });

    return {
      success: true,
      data: {
        bookingId: updated.id,
        referenceCode: updated.referenceCode,
        depositStatus: updated.depositStatus,
        whatsappDepositProofUrl,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de mettre à jour le statut de l’acompte.';
    return { success: false, error: message };
  }
}

const getBookingConfirmationSchema = z
  .object({
    bookingId: z.string().min(1),
    referenceCode: z.string().min(1),
  })
  .strict();

export interface BookingConfirmationDetailsDTO {
  bookingId: string;
  referenceCode: string;
  status: BookingStatus;
  depositStatus: DepositStatus;
  clientName: string;
  serviceName: string;
  dateKey: string;
  startTimeLabel: string;
  endTimeLabel: string;
  totalPriceXof: number;
  depositAmountXof: number;
  remainingAmountXof: number;
  zoneLabel: string;
  exactAddress: string | null; // Null tant que l'acompte n'est pas CONFIRMED
  prepInstructions: string | null;
}

/**
 * Étape 6 : Récupère le récapitulatif de la réservation.
 * Règle de confidentialité : `exactAddress` n'est révélée que si `status === CONFIRMED` ou `COMPLETED`.
 */
export async function getBookingConfirmationDetailsAction(
  rawInput: z.infer<typeof getBookingConfirmationSchema>
): Promise<ActionResult<BookingConfirmationDetailsDTO>> {
  try {
    const input = getBookingConfirmationSchema.parse(rawInput);

    const [booking, settings] = await Promise.all([
      prisma.booking.findFirst({
        where: {
          id: input.bookingId,
          referenceCode: input.referenceCode,
        },
        include: { service: true },
      }),
      prisma.studioSettings.upsert({
        where: { id: 'default' },
        update: {},
        create: { id: 'default' },
      }),
    ]);

    if (!booking) {
      return { success: false, error: 'Réservation introuvable.' };
    }

    const isAddressUnlocked =
      booking.status === BookingStatus.CONFIRMED ||
      booking.status === BookingStatus.COMPLETED;

    return {
      success: true,
      data: {
        bookingId: booking.id,
        referenceCode: booking.referenceCode,
        status: booking.status,
        depositStatus: booking.depositStatus,
        clientName: booking.clientName,
        serviceName: booking.service.name,
        dateKey: booking.dateKey,
        startTimeLabel: booking.startTimeLabel,
        endTimeLabel: booking.endTimeLabel,
        totalPriceXof: booking.totalPriceXof,
        depositAmountXof: booking.depositAmountXof,
        remainingAmountXof: booking.totalPriceXof - booking.depositAmountXof,
        zoneLabel: settings.zoneLabel,
        exactAddress: isAddressUnlocked ? settings.exactAddress : null,
        prepInstructions: booking.service.prepInstructions,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de charger les détails de la réservation.';
    return { success: false, error: message };
  }
}

const adminBookingActionSchema = z
  .object({
    adminPin: z.string().min(1),
    bookingId: z.string().min(1),
  })
  .strict();

/**
 * Back-Office (/admin) : Validation de l'acompte en 1 clic et génération du lien WhatsApp de confirmation (avec adresse exacte).
 */
export async function confirmBookingDepositAction(
  rawInput: z.infer<typeof adminBookingActionSchema>
): Promise<
  ActionResult<{
    bookingId: string;
    status: BookingStatus;
    clientConfirmationWhatsAppUrl: string;
  }>
> {
  try {
    const input = adminBookingActionSchema.parse(rawInput);
    await verifyAdminPinOrThrow(input.adminPin);
    if (!(await isDatabaseReachableFast())) {
      return {
        success: false,
        error: 'Base de données hors-ligne (mode local actif).',
      };
    }
    const now = new Date();

    const [booking, settings] = await Promise.all([
      prisma.booking.update({
        where: { id: input.bookingId },
        data: {
          status: BookingStatus.CONFIRMED,
          depositStatus: DepositStatus.CONFIRMED,
          depositConfirmedAt: now,
          lockedUntil: null,
        },
        include: { service: true },
      }),
      prisma.studioSettings.upsert({
        where: { id: 'default' },
        update: {},
        create: { id: 'default' },
      }),
    ]);

    const clientConfirmationWhatsAppUrl = buildBookingConfirmedWhatsAppUrl({
      clientPhone: booking.clientPhone,
      clientName: booking.clientName,
      referenceCode: booking.referenceCode,
      serviceName: booking.service.name,
      dateKey: booking.dateKey,
      startTimeLabel: booking.startTimeLabel,
      depositAmountXof: booking.depositAmountXof,
      remainingAmountXof: booking.totalPriceXof - booking.depositAmountXof,
      exactAddress: settings.exactAddress,
    });

    return {
      success: true,
      data: {
        bookingId: booking.id,
        status: booking.status,
        clientConfirmationWhatsAppUrl,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de confirmer cet acompte.';
    return { success: false, error: message };
  }
}

/**
 * Back-Office (/admin) : Bouton « Prestation terminée » -> Passe la réservation en COMPLETED,
 * génère de manière idempotente le token d'avis unique et retourne le lien WhatsApp prêt à envoyer.
 */
export async function completeBookingAndGenerateReviewLinkAction(
  rawInput: z.infer<typeof adminBookingActionSchema>
): Promise<
  ActionResult<{
    bookingId: string;
    reviewToken: string;
    reviewInviteWhatsAppUrl: string;
  }>
> {
  try {
    const input = adminBookingActionSchema.parse(rawInput);
    await verifyAdminPinOrThrow(input.adminPin);
    if (!(await isDatabaseReachableFast())) {
      return {
        success: false,
        error: 'Base de données hors-ligne (mode local actif).',
      };
    }
    const now = new Date();

    const result = await prisma.$transaction(async (tx) => {
      const booking = await tx.booking.update({
        where: { id: input.bookingId },
        data: {
          status: BookingStatus.COMPLETED,
          depositStatus: DepositStatus.CONFIRMED,
          completedAt: now,
          lockedUntil: null,
        },
        include: {
          service: true,
          review: true,
        },
      });

      if (booking.review) {
        return {
          booking,
          reviewToken: booking.review.token,
        };
      }

      const token = crypto.randomBytes(24).toString('hex');
      const expiresAt = new Date(now.getTime() + 14 * 24 * 3_600_000); // Valide 14 jours

      const createdReview = await tx.review.create({
        data: {
          bookingId: booking.id,
          token,
          serviceNameSnap: booking.service.name,
          moderationStatus: ReviewModerationStatus.INVITED,
          expiresAt,
        },
      });

      return {
        booking,
        reviewToken: createdReview.token,
      };
    });

    const reviewInviteWhatsAppUrl = buildReviewRequestWhatsAppUrl({
      clientPhone: result.booking.clientPhone,
      clientName: result.booking.clientName,
      serviceName: result.booking.service.name,
      reviewToken: result.reviewToken,
    });

    return {
      success: true,
      data: {
        bookingId: result.booking.id,
        reviewToken: result.reviewToken,
        reviewInviteWhatsAppUrl,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de clôturer la prestation.';
    return { success: false, error: message };
  }
}

const cancelBookingSchema = z
  .object({
    adminPin: z.string().min(1),
    bookingId: z.string().min(1),
    reason: z.string().trim().max(240).optional(),
  })
  .strict();

/**
 * Back-Office (/admin) : Annule une réservation et libère immédiatement le créneau dans le calendrier.
 */
export async function cancelBookingAction(
  rawInput: z.infer<typeof cancelBookingSchema>
): Promise<ActionResult<{ bookingId: string; status: BookingStatus }>> {
  try {
    const input = cancelBookingSchema.parse(rawInput);
    await verifyAdminPinOrThrow(input.adminPin);
    if (!(await isDatabaseReachableFast())) {
      return {
        success: false,
        error: 'Base de données hors-ligne (mode local actif).',
      };
    }

    const updated = await prisma.booking.update({
      where: { id: input.bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        lockedUntil: null,
        cancelledAt: new Date(),
        cancellationReason: input.reason ?? 'Annulé par la praticienne',
      },
      select: { id: true, status: true },
    });

    return {
      success: true,
      data: { bookingId: updated.id, status: updated.status },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible d’annuler cette réservation.';
    return { success: false, error: message };
  }
}

const listAdminBookingsSchema = z
  .object({
    adminPin: z.string().min(1),
    page: z.number().int().min(1).default(1),
    limit: z.number().int().min(1).max(100).default(20),
    statusFilter: z.nativeEnum(BookingStatus).optional(),
  })
  .strict();

export interface AdminBookingItemDTO {
  id: string;
  referenceCode: string;
  clientName: string;
  clientPhone: string;
  clientInstagram: string | null;
  clientNotes: string | null;
  serviceName: string;
  dateKey: string;
  startTimeLabel: string;
  endTimeLabel: string;
  totalPriceXof: number;
  depositAmountXof: number;
  paymentMethod: PaymentMethod;
  depositStatus: DepositStatus;
  status: BookingStatus;
  reviewToken: string | null;
  createdAtIso: string;
}

/**
 * Back-Office (/admin) : Liste paginée des réservations avec métadonnées complètes.
 */
export async function listAdminBookingsAction(
  rawInput: z.infer<typeof listAdminBookingsSchema>
): Promise<
  ActionResult<{
    data: AdminBookingItemDTO[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>
> {
  try {
    const input = listAdminBookingsSchema.parse(rawInput);
    await verifyAdminPinOrThrow(input.adminPin);
    if (!(await isDatabaseReachableFast())) {
      return {
        success: false,
        error: 'Base de données hors-ligne (mode local actif).',
      };
    }

    const whereClause: Prisma.BookingWhereInput = input.statusFilter
      ? { status: input.statusFilter }
      : {};

    const skip = (input.page - 1) * input.limit;

    const [total, rows] = await Promise.all([
      prisma.booking.count({ where: whereClause }),
      prisma.booking.findMany({
        where: whereClause,
        include: {
          service: { select: { name: true } },
          review: { select: { token: true } },
        },
        orderBy: [{ startAt: 'desc' }],
        skip,
        take: input.limit,
      }),
    ]);

    return {
      success: true,
      data: {
        data: rows.map((row) => ({
          id: row.id,
          referenceCode: row.referenceCode,
          clientName: row.clientName,
          clientPhone: row.clientPhone,
          clientInstagram: row.clientInstagram,
          clientNotes: row.clientNotes,
          serviceName: row.service.name,
          dateKey: row.dateKey,
          startTimeLabel: row.startTimeLabel,
          endTimeLabel: row.endTimeLabel,
          totalPriceXof: row.totalPriceXof,
          depositAmountXof: row.depositAmountXof,
          paymentMethod: row.paymentMethod,
          depositStatus: row.depositStatus,
          status: row.status,
          reviewToken: row.review?.token ?? null,
          createdAtIso: row.createdAt.toISOString(),
        })),
        meta: {
          total,
          page: input.page,
          limit: input.limit,
          totalPages: Math.max(1, Math.ceil(total / input.limit)),
        },
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de charger les réservations.';
    return { success: false, error: message };
  }
}

