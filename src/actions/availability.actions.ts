'use server';

import crypto from 'node:crypto';
import { BlackoutType } from '@prisma/client';
import { z } from 'zod';
import { isDatabaseReachableFast, prisma } from '@/lib/prisma';
import {
  AvailabilityCalendarResult,
  computeAvailabilityCalendar,
  toDakarDateKey,
  addDaysToDateKey,
  buildDakarDateTime,
} from '@/lib/slot-engine';

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
}

export interface ServiceCatalogItemDTO {
  id: string;
  slug: string;
  name: string;
  category: 'FULL_SET' | 'REFILL';
  shortDescription: string;
  fullDescription: string | null;
  priceXof: number;
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

/**
 * Vérification cryptographique en temps constant du code PIN d'administration (/admin).
 */
export async function verifyAdminPinOrThrow(pin: string): Promise<void> {
  const expectedPin = process.env.ADMIN_ACCESS_PIN;
  if (!expectedPin || expectedPin.trim().length === 0) {
    throw new Error(
      'Configuration serveur incomplète : ADMIN_ACCESS_PIN manquant.'
    );
  }
  const cleanInput = pin.trim();
  const inputBuffer = Buffer.from(cleanInput, 'utf8');
  const expectedBuffer = Buffer.from(expectedPin.trim(), 'utf8');

  if (
    inputBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(inputBuffer, expectedBuffer)
  ) {
    throw new Error('Code PIN praticienne invalide.');
  }
}

async function getOrCreateStudioSettings() {
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
        },
        services: services.map((s) => ({
          id: s.id,
          slug: s.slug,
          name: s.name,
          category: s.category,
          shortDescription: s.shortDescription,
          fullDescription: s.fullDescription,
          priceXof: s.priceXof,
          depositXof: s.depositXof,
          durationMinutes: s.durationMinutes,
          bufferMinutes: s.bufferMinutes,
          naturalLashesOnly: s.naturalLashesOnly,
          refillAccepted: s.refillAccepted,
          refillConditions: s.refillConditions,
          prepInstructions: s.prepInstructions,
          imageUrl: s.imageUrl,
          displayOrder: s.displayOrder,
        })),
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
      weeklySchedules,
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
): Promise<ActionResult<{ id: string }>> {
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
      select: { id: true },
    });

    return { success: true, data: { id: created.id } };
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

    return { success: true, data: { deletedId: input.blackoutId } };
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : 'Impossible de supprimer ce blocage.';
    return { success: false, error: message };
  }
}

