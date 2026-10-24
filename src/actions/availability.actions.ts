'use server';

import crypto from 'node:crypto';
import { BlackoutType } from '@prisma/client';
import { z } from 'zod';
import { isDatabaseReachableFast, prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import {
  AvailabilityCalendarResult,
  computeAvailabilityCalendar,
  toDakarDateKey,
  addDaysToDateKey,
  buildDakarDateTime,
  resolveFullWeeklySchedules,
} from '@/lib/slot-engine';
import { invalidateVitrineCache } from '@/lib/catalog-fallback';

function safeRevalidatePath(path: string) {
  try {
    revalidatePath(path);
  } catch {
    // Ignore in CLI test environment
  }
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface PublicStudioSettingsDTO {
  studioName: string;
  tagline: string;
  zoneLabel: string; // L'adresse exacte (`exactAddress`) est strictement exclue ici
  whatsappPhone: string;
  wavePhone: string;
  orangeMoneyPhone: string;
  instagramHandle: string;
  timezone: string;
  minNoticeHours: number;
  defaultBufferMinutes: number;
  slotHoldMinutes: number;
  maxAdvanceDays: number;
  examModeActive: boolean;
  examModeMessage: string | null;
  promoModeActive: boolean;
  promoPriceXof: number | null;
  promoBannerMessage: string | null;
}

export interface ServiceCatalogItemDTO {
  id: string;
  slug: string;
  name: string;
  category: 'FULL_SET' | 'REFILL';
  shortDescription: string;
  fullDescription: string | null;
  priceXof: number;
  regularPriceXof: number | null;
  effectivePriceXof: number;
  isPromoActive: boolean;
  depositXof: number;
  durationMinutes: number;
  bufferMinutes: number;
  naturalLashesOnly: boolean;
  refillAccepted: boolean;
  refillConditions: string | null;
  prepInstructions: string | null;
  imageUrl: string;
  displayOrder: number;
}

interface PinRateLimitRecord {
  failures: number;
  lockedUntil: number;
  firstAttemptAt: number;
}

const pinRateLimiterMap = new Map<string, PinRateLimitRecord>();
const MAX_FAILURES = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes de blocage après 5 échecs
const WINDOW_MS = 10 * 60 * 1000; // Fenêtre glissante de 10 minutes

/**
 * Nettoyage préventif des entrées expirées du rate limiter pour éviter les fuites mémoire.
 */
function pruneExpiredRateLimitRecords(now: number): void {
  if (pinRateLimiterMap.size > 500) {
    for (const [key, record] of pinRateLimiterMap.entries()) {
      if (now > record.lockedUntil && now - record.firstAttemptAt > WINDOW_MS) {
        pinRateLimiterMap.delete(key);
      }
    }
  }
}

/**
 * Vérification cryptographique en temps constant du code PIN d'administration (/admin),
 * doublée d'un rate-limiter anti-bruteforce résistant aux attaques par dictionnaire.
 */
export async function verifyAdminPinOrThrow(pin: string): Promise<void> {
  const expectedPin = process.env.ADMIN_ACCESS_PIN;
  if (!expectedPin || expectedPin.trim().length === 0) {
    throw new Error(
      'Configuration serveur incomplète : ADMIN_ACCESS_PIN manquant.'
    );
  }

  // Extraction sécurisée de l'adresse IP (supporte Vercel Edge/Serverless & fallback runner)
  let clientKey = 'direct';
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    clientKey =
      headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      headerList.get('x-real-ip') ||
      'direct';
  } catch {
    // Exécution hors contexte HTTP (tests unitaires ou scripts de build)
    clientKey = 'test-runner';
  }

  const now = Date.now();
  pruneExpiredRateLimitRecords(now);

  const existingRecord = pinRateLimiterMap.get(clientKey);

  // Vérifier si le client est actuellement en période de verrouillage (Lockout)
  if (existingRecord && existingRecord.lockedUntil > now) {
    const remainingSeconds = Math.ceil((existingRecord.lockedUntil - now) / 1000);
    throw new Error(
      `Accès praticienne temporairement verrouillé pour sécurité. Réessaie dans ${remainingSeconds} secondes.`
    );
  }

  const cleanInput = pin.trim();
  const inputBuffer = Buffer.from(cleanInput, 'utf8');
  const expectedBuffer = Buffer.from(expectedPin.trim(), 'utf8');

  const isMatch =
    inputBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(inputBuffer, expectedBuffer);

  if (!isMatch) {
    const record =
      existingRecord && now - existingRecord.firstAttemptAt < WINDOW_MS
        ? existingRecord
        : { failures: 0, lockedUntil: 0, firstAttemptAt: now };

    record.failures += 1;

    if (record.failures >= MAX_FAILURES) {
      record.lockedUntil = now + LOCKOUT_MS;
      pinRateLimiterMap.set(clientKey, record);
      throw new Error(
        'Code PIN praticienne invalide. 5 tentatives échouées : accès bloqué 15 minutes.'
      );
    }

    pinRateLimiterMap.set(clientKey, record);

    // Ralentissement exponentiel anti-automatisation (200ms -> 800ms)
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(1000, record.failures * 200))
    );

    throw new Error('Code PIN praticienne invalide.');
  }

  // En cas de succès : reset du compteur pour cette IP
  if (existingRecord) {
    pinRateLimiterMap.delete(clientKey);
  }
}

async function getOrCreateStudioSettings() {
  const existing = await prisma.studioSettings.findUnique({
    where: { id: 'default' },
  });
  if (existing) return existing;

  return prisma.studioSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: { id: 'default' },
  });
}

/**
 * Récupère le catalogue des prestations actives et les paramètres publics du studio
 * (sans jamais exposer `exactAddress`).
 */
export async function getCatalogAndSettingsAction(): Promise<
  ActionResult<{
    settings: PublicStudioSettingsDTO;
    services: ServiceCatalogItemDTO[];
  }>
> {
  try {
    const [settings, services] = await Promise.all([
      getOrCreateStudioSettings(),
      prisma.service.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: 'asc' },
        take: 20,
      }),
    ]);

    return {
      success: true,
      data: {
        settings: {
          studioName: settings.studioName,
          tagline: settings.tagline,
          zoneLabel: settings.zoneLabel,
          whatsappPhone: settings.whatsappPhone,
          wavePhone: settings.wavePhone,
          orangeMoneyPhone: settings.orangeMoneyPhone,
          instagramHandle: settings.instagramHandle,
          timezone: settings.timezone,
          minNoticeHours: settings.minNoticeHours,
          defaultBufferMinutes: settings.defaultBufferMinutes,
          slotHoldMinutes: settings.slotHoldMinutes,
          maxAdvanceDays: settings.maxAdvanceDays,
          examModeActive: settings.examModeActive,
          examModeMessage: settings.examModeMessage,
          promoModeActive: settings.promoModeActive,
          promoPriceXof: settings.promoPriceXof,
          promoBannerMessage: settings.promoBannerMessage,
        },
        services: services.map((s) => {
          const promoCeiling = settings.promoPriceXof;
          const hasPromoApplicable =
            settings.promoModeActive &&
            s.category === 'FULL_SET' &&
            typeof promoCeiling === 'number' &&
            promoCeiling > 0;

          const effectivePriceXof = hasPromoApplicable
            ? Math.min(s.priceXof, promoCeiling)
            : s.priceXof;

          const benchmarkPrice = s.regularPriceXof ?? s.priceXof;
          const isPromoActive =
            hasPromoApplicable && effectivePriceXof < benchmarkPrice;

          const regularPriceXof = isPromoActive
            ? benchmarkPrice
            : (s.regularPriceXof ?? null);

          return {
            id: s.id,
            slug: s.slug,
            name: s.name,
            category: s.category,
            shortDescription: s.shortDescription,
            fullDescription: s.fullDescription,
            priceXof: effectivePriceXof,
            regularPriceXof,
            effectivePriceXof,
            isPromoActive,
            depositXof: s.depositXof,
            durationMinutes: s.durationMinutes,
            bufferMinutes: s.bufferMinutes,
            naturalLashesOnly: s.naturalLashesOnly,
            refillAccepted: s.refillAccepted,
            refillConditions: s.refillConditions,
            prepInstructions: s.prepInstructions,
            imageUrl: s.imageUrl,
            displayOrder: s.displayOrder,
          };
        }),
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de charger les prestations.';
    return { success: false, error: message };
  }
}

const getAvailabilityInputSchema = z
  .object({
    serviceId: z.string().min(1, 'Identifiant de prestation requis.'),
    startDateKey: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    numberOfDays: z.number().int().min(1).max(60).optional(),
  })
  .strict();

/**
 * Calcule les jours et créneaux réellement ouverts pour une prestation donnée.
 */
export async function getServiceAvailabilityAction(
  rawInput: z.infer<typeof getAvailabilityInputSchema>
): Promise<ActionResult<AvailabilityCalendarResult>> {
  try {
    const input = getAvailabilityInputSchema.parse(rawInput);
    if (!(await isDatabaseReachableFast())) {
      return {
        success: false,
        error: 'Base de données hors-ligne (mode local actif).',
      };
    }
    const now = new Date();

    const [settings, service, weeklySchedules] = await Promise.all([
      getOrCreateStudioSettings(),
      prisma.service.findFirst({
        where: { id: input.serviceId, isActive: true },
      }),
      prisma.weeklySchedule.findMany({
        where: { isActive: true },
        orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
        take: 50,
      }),
    ]);

    if (!service) {
      return {
        success: false,
        error: 'Cette prestation est introuvable ou indisponible.',
      };
    }

    const startDateKey = input.startDateKey ?? toDakarDateKey(now);
    const totalDays = input.numberOfDays ?? settings.maxAdvanceDays;
    const endDateKey = addDaysToDateKey(startDateKey, totalDays + 1);

    const rangeStartUtc = buildDakarDateTime(startDateKey, 0);
    const rangeEndUtc = buildDakarDateTime(endDateKey, 0);

    const [blackoutPeriods, existingBookings] = await Promise.all([
      prisma.blackoutPeriod.findMany({
        where: {
          startAt: { lt: rangeEndUtc },
          endAt: { gt: rangeStartUtc },
        },
        orderBy: { startAt: 'asc' },
        take: 100,
      }),
      prisma.booking.findMany({
        where: {
          startAt: { lt: rangeEndUtc },
          bufferEndAt: { gt: rangeStartUtc },
          status: {
            in: ['PENDING_DEPOSIT', 'CONFIRMED', 'COMPLETED'],
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
        take: 100,
      }),
    ]);

    const calendar = computeAvailabilityCalendar({
      startDateKey,
      numberOfDays: totalDays,
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

    return { success: true, data: calendar };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de calculer les créneaux disponibles.';
    return { success: false, error: message };
  }
}

const toggleExamModeSchema = z
  .object({
    adminPin: z.string().min(1),
    examModeActive: z.boolean(),
    examModeMessage: z.string().trim().max(280).optional(),
  })
  .strict();

/**
 * Back-Office (/admin) : Active ou désactive le Mode Examens en 1 clic.
 */
export async function toggleExamModeAction(
  rawInput: z.infer<typeof toggleExamModeSchema>
): Promise<ActionResult<{ examModeActive: boolean; examModeMessage: string | null }>> {
  try {
    const input = toggleExamModeSchema.parse(rawInput);
    await verifyAdminPinOrThrow(input.adminPin);
    if (!(await isDatabaseReachableFast())) {
      return {
        success: false,
        error: 'Base de données hors-ligne (mode local actif).',
      };
    }

    const updated = await prisma.studioSettings.upsert({
      where: { id: 'default' },
      update: {
        examModeActive: input.examModeActive,
        ...(input.examModeMessage !== undefined
          ? { examModeMessage: input.examModeMessage }
          : {}),
      },
      create: {
        id: 'default',
        examModeActive: input.examModeActive,
        examModeMessage: input.examModeMessage,
      },
    });

    invalidateVitrineCache();
    safeRevalidatePath('/');
    safeRevalidatePath('/reserver');
    safeRevalidatePath('/admin');

    return {
      success: true,
      data: {
        examModeActive: updated.examModeActive,
        examModeMessage: updated.examModeMessage,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de modifier le Mode Examens.';
    return { success: false, error: message };
  }
}

export interface BlackoutPeriodDTO {
  id: string;
  title: string;
  type: BlackoutType;
  startAtIso: string;
  endAtIso: string;
  isAllDay: boolean;
  reason: string | null;
  createdAtIso: string;
}

const listBlackoutSchema = z
  .object({
    adminPin: z.string().min(1),
  })
  .strict();

/**
 * Back-Office (/admin) : Liste les fermetures manuelles et périodes d'examens actives.
 */
export async function listBlackoutPeriodsAction(
  rawInput: z.infer<typeof listBlackoutSchema>
): Promise<ActionResult<BlackoutPeriodDTO[]>> {
  try {
    const input = listBlackoutSchema.parse(rawInput);
    await verifyAdminPinOrThrow(input.adminPin);
    if (!(await isDatabaseReachableFast())) {
      return { success: true, data: [] };
    }

    const periods = await prisma.blackoutPeriod.findMany({
      orderBy: { startAt: 'desc' },
      take: 50,
    });

    return {
      success: true,
      data: periods.map((p) => ({
        id: p.id,
        title: p.title,
        type: p.type,
        startAtIso: p.startAt.toISOString(),
        endAtIso: p.endAt.toISOString(),
        isAllDay: p.isAllDay,
        reason: p.reason,
        createdAtIso: p.createdAt.toISOString(),
      })),
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de charger les fermetures.';
    return { success: false, error: message };
  }
}

const createBlackoutSchema = z
  .object({
    adminPin: z.string().min(1),
    title: z.string().trim().min(2).max(120),
    type: z.nativeEnum(BlackoutType).default(BlackoutType.MANUAL_BLOCK),
    startAtIso: z.string().datetime(),
    endAtIso: z.string().datetime(),
    isAllDay: z.boolean().default(false),
    reason: z.string().trim().max(240).optional(),
  })
  .strict();

/**
 * Back-Office (/admin) : Ferme rapidement un créneau horaire, une journée ou une période d'examens.
 */
export async function createBlackoutPeriodAction(
  rawInput: z.infer<typeof createBlackoutSchema>
): Promise<ActionResult<BlackoutPeriodDTO>> {
  try {
    const input = createBlackoutSchema.parse(rawInput);
    await verifyAdminPinOrThrow(input.adminPin);
    if (!(await isDatabaseReachableFast())) {
      return {
        success: false,
        error: 'Base de données hors-ligne (mode local actif).',
      };
    }

    const startAt = new Date(input.startAtIso);
    const endAt = new Date(input.endAtIso);

    if (endAt.getTime() <= startAt.getTime()) {
      return {
        success: false,
        error: 'La fin du blocage doit être postérieure au début.',
      };
    }

    const created = await prisma.blackoutPeriod.create({
      data: {
        title: input.title,
        type: input.type,
        startAt,
        endAt,
        isAllDay: input.isAllDay,
        reason: input.reason ?? null,
      },
    });

    invalidateVitrineCache();
    safeRevalidatePath('/reserver');
    safeRevalidatePath('/admin');

    return {
      success: true,
      data: {
        id: created.id,
        title: created.title,
        type: created.type,
        startAtIso: created.startAt.toISOString(),
        endAtIso: created.endAt.toISOString(),
        isAllDay: created.isAllDay,
        reason: created.reason,
        createdAtIso: created.createdAt.toISOString(),
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de fermer ce créneau.';
    return { success: false, error: message };
  }
}

const deleteBlackoutSchema = z
  .object({
    adminPin: z.string().min(1),
    blackoutId: z.string().min(1),
  })
  .strict();

/**
 * Back-Office (/admin) : Supprime une fermeture manuelle ou période d'examens.
 */
export async function deleteBlackoutPeriodAction(
  rawInput: z.infer<typeof deleteBlackoutSchema>
): Promise<ActionResult<{ deletedId: string }>> {
  try {
    const input = deleteBlackoutSchema.parse(rawInput);
    await verifyAdminPinOrThrow(input.adminPin);

    await prisma.blackoutPeriod.delete({
      where: { id: input.blackoutId },
    });

    invalidateVitrineCache();
    safeRevalidatePath('/reserver');
    safeRevalidatePath('/admin');

    return { success: true, data: { deletedId: input.blackoutId } };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de supprimer ce blocage.';
    return { success: false, error: message };
  }
}

const updatePromoModeSchema = z
  .object({
    adminPin: z.string().min(1),
    active: z.boolean(),
    promoPriceXof: z.number().int().min(1000).max(100000).optional(),
    promoBannerMessage: z.string().trim().max(300).optional(),
  })
  .strict();

/**
 * Back-Office (/admin) : Active ou désactive le mode promo global et met à jour le message d'annonce.
 */
export async function updatePromoModeAction(
  rawInput: z.infer<typeof updatePromoModeSchema>
): Promise<
  ActionResult<{
    promoModeActive: boolean;
    promoPriceXof: number | null;
    promoBannerMessage: string | null;
  }>
> {
  try {
    const input = updatePromoModeSchema.parse(rawInput);
    await verifyAdminPinOrThrow(input.adminPin);

    const updated = await prisma.studioSettings.upsert({
      where: { id: 'default' },
      update: {
        promoModeActive: input.active,
        ...(input.promoPriceXof !== undefined
          ? { promoPriceXof: input.promoPriceXof }
          : {}),
        ...(input.promoBannerMessage !== undefined
          ? { promoBannerMessage: input.promoBannerMessage }
          : {}),
      },
      create: {
        id: 'default',
        promoModeActive: input.active,
        promoPriceXof: input.promoPriceXof ?? 15000,
        promoBannerMessage:
          input.promoBannerMessage ??
          'Offre de lancement : toutes nos poses d’extensions sont à 15 000 FCFA !',
      },
    });

    invalidateVitrineCache();
    safeRevalidatePath('/');
    safeRevalidatePath('/prestations');
    safeRevalidatePath('/reserver');
    safeRevalidatePath('/admin');

    return {
      success: true,
      data: {
        promoModeActive: updated.promoModeActive,
        promoPriceXof: updated.promoPriceXof,
        promoBannerMessage: updated.promoBannerMessage,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de modifier le mode promo.';
    return { success: false, error: message };
  }
}

const updateServicePricingSchema = z
  .object({
    adminPin: z.string().min(1),
    serviceId: z.string().min(1),
    priceXof: z.number().int().min(1000).max(200000),
    regularPriceXof: z
      .number()
      .int()
      .min(1000)
      .max(200000)
      .nullable()
      .optional(),
    depositXof: z.number().int().min(1000).max(100000),
  })
  .strict()
  .refine((data) => data.depositXof <= data.priceXof, {
    message: "L'acompte ne peut pas dépasser le tarif total de la prestation.",
    path: ['depositXof'],
  });

/**
 * Back-Office (/admin) : Met à jour le tarif total et l'acompte d'une prestation spécifique.
 */
export async function updateServicePricingAction(
  rawInput: z.infer<typeof updateServicePricingSchema>
): Promise<
  ActionResult<{
    id: string;
    priceXof: number;
    regularPriceXof: number | null;
    depositXof: number;
  }>
> {
  try {
    const input = updateServicePricingSchema.parse(rawInput);
    await verifyAdminPinOrThrow(input.adminPin);

    const updated = await prisma.service.update({
      where: { id: input.serviceId },
      data: {
        priceXof: input.priceXof,
        regularPriceXof: input.regularPriceXof ?? null,
        depositXof: input.depositXof,
      },
      select: {
        id: true,
        priceXof: true,
        regularPriceXof: true,
        depositXof: true,
      },
    });

    invalidateVitrineCache();
    safeRevalidatePath('/');
    safeRevalidatePath('/prestations');
    safeRevalidatePath('/reserver');
    safeRevalidatePath('/admin');

    return {
      success: true,
      data: {
        id: updated.id,
        priceXof: updated.priceXof,
        regularPriceXof: updated.regularPriceXof,
        depositXof: updated.depositXof,
      },
    };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de mettre à jour le tarif de la prestation.';
    return { success: false, error: message };
  }
}

