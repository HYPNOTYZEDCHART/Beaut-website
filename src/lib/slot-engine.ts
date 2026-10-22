export type SlotBookingStatus =
  | 'PENDING_DEPOSIT'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'EXPIRED';

export const DAKAR_TIMEZONE = 'Africa/Dakar' as const;

export interface SlotEngineSettings {
  minNoticeHours: number; // Ex: 24 ou 48
  defaultBufferMinutes: number; // Ex: 20 (borné entre 15 et 30 min minimum)
  slotHoldMinutes: number; // Ex: 20 min de verrouillage pendant l'acompte
  maxAdvanceDays: number; // Ex: 30 jours
  slotIntervalMinutes: number; // Ex: 30 min
  examModeActive: boolean;
  examModeMessage?: string | null;
}

export interface SlotEngineService {
  id: string;
  name: string;
  durationMinutes: number;
  bufferMinutes: number;
  priceXof: number;
  depositXof: number;
}

export interface WeeklyTimeWindow {
  id?: string;
  dayOfWeek: number; // 0 (Dimanche) -> 6 (Samedi)
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  isActive: boolean;
}

export interface TimeRangeBlock {
  id?: string;
  startAt: Date;
  endAt: Date;
  title?: string;
}

export interface ExistingBookingBlock {
  id: string;
  status: SlotBookingStatus;
  startAt: Date;
  endAt: Date;
  bufferEndAt: Date;
  lockedUntil: Date | null;
}

export interface ComputedSlot {
  dateKey: string; // "YYYY-MM-DD" (Africa/Dakar)
  startTimeLabel: string; // "HH:mm" (Africa/Dakar)
  endTimeLabel: string; // "HH:mm" fin de la pose (Africa/Dakar)
  bufferEndTimeLabel: string; // "HH:mm" fin du nettoyage (Africa/Dakar)
  startAtIso: string; // ISO UTC
  endAtIso: string; // ISO UTC
  bufferEndAtIso: string; // ISO UTC
  durationMinutes: number;
  bufferMinutes: number;
}

export interface DayAvailability {
  dateKey: string; // "YYYY-MM-DD"
  dayOfWeek: number; // 0..6
  isOpen: boolean;
  slots: ComputedSlot[];
}

export interface AvailabilityCalendarResult {
  examModeActive: boolean;
  examModeMessage: string | null;
  timezone: typeof DAKAR_TIMEZONE;
  minNoticeHours: number;
  days: DayAvailability[];
}

const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const TIME_LABEL_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Vérifie si deux intervalles semi-ouverts [startA, endA) et [startB, endB) se chevauchent.
 */
export function intervalsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date
): boolean {
  return startA.getTime() < endB.getTime() && endA.getTime() > startB.getTime();
}

/**
 * Convertit une heure "HH:mm" en nombre de minutes depuis minuit.
 */
export function parseTimeLabelToMinutes(timeLabel: string): number {
  const match = TIME_LABEL_REGEX.exec(timeLabel.trim());
  if (!match || match[1] === undefined || match[2] === undefined) {
    throw new Error(`Format d'heure invalide (attendu HH:mm) : "${timeLabel}"`);
  }
  const hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  return hours * 60 + minutes;
}

/**
 * Formate un nombre de minutes depuis minuit en "HH:mm".
 */
export function formatMinutesToTimeLabel(totalMinutes: number): string {
  const normalized = ((totalMinutes % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

/**
 * Dakar (Africa/Dakar) est en UTC+0 constant toute l'année (sans changement d'heure).
 * Construit un objet Date UTC exact à partir d'un dateKey "YYYY-MM-DD" et de minutes depuis minuit.
 */
export function buildDakarDateTime(
  dateKey: string,
  minutesFromMidnight: number
): Date {
  if (!DATE_KEY_REGEX.test(dateKey)) {
    throw new Error(`Format de date invalide (attendu YYYY-MM-DD) : "${dateKey}"`);
  }
  const baseMidnightUtc = new Date(`${dateKey}T00:00:00.000Z`);
  if (Number.isNaN(baseMidnightUtc.getTime())) {
    throw new Error(`Date calendaire invalide : "${dateKey}"`);
  }
  return new Date(baseMidnightUtc.getTime() + minutesFromMidnight * 60_000);
}

/**
 * Extrait le dateKey "YYYY-MM-DD" en heure de Dakar (UTC+0) à partir d'une Date.
 */
export function toDakarDateKey(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Extrait l'heure "HH:mm" en heure de Dakar (UTC+0) à partir d'une Date.
 */
export function toDakarTimeLabel(date: Date): string {
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Retourne le jour de la semaine (0 = Dimanche .. 6 = Samedi) pour un dateKey à Dakar.
 */
export function getDakarDayOfWeek(dateKey: string): number {
  const d = buildDakarDateTime(dateKey, 0);
  return d.getUTCDay();
}

/**
 * Ajoute `days` jours à un dateKey "YYYY-MM-DD" et retourne le nouveau dateKey.
 */
export function addDaysToDateKey(dateKey: string, days: number): string {
  const d = buildDakarDateTime(dateKey, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return toDakarDateKey(d);
}

/**
 * Normalise la marge entre deux clientes (Règle métier n°3 : 15 à 30 minutes minimum).
 */
export function resolveEffectiveBufferMinutes(
  serviceBufferMinutes: number,
  defaultBufferMinutes: number
): number {
  const raw =
    serviceBufferMinutes > 0 ? serviceBufferMinutes : defaultBufferMinutes;
  return Math.max(15, raw);
}

/**
 * Détermine si une réservation en base bloque actuellement le créneau (Règle métier n°5).
 * - CONFIRMED et COMPLETED bloquent définitivement le créneau.
 * - PENDING_DEPOSIT bloque le créneau tant que son verrou temporaire `lockedUntil` n'est pas expiré.
 */
export function isBookingBlockingSlot(
  booking: ExistingBookingBlock,
  now: Date
): boolean {
  if (
    booking.status === 'CONFIRMED' ||
    booking.status === 'COMPLETED'
  ) {
    return true;
  }

  if (
    booking.status === 'PENDING_DEPOSIT' &&
    booking.lockedUntil !== null &&
    booking.lockedUntil.getTime() > now.getTime()
  ) {
    return true;
  }

  return false;
}

/**
 * Calcule tous les créneaux disponibles pour une journée précise (`dateKey`) et une prestation donnée.
 */
export function computeAvailableSlotsForDay(params: {
  dateKey: string;
  service: SlotEngineService;
  settings: SlotEngineSettings;
  weeklySchedules: readonly WeeklyTimeWindow[];
  blackoutPeriods: readonly TimeRangeBlock[];
  existingBookings: readonly ExistingBookingBlock[];
  now?: Date;
}): ComputedSlot[] {
  const {
    dateKey,
    service,
    settings,
    weeklySchedules,
    blackoutPeriods,
    existingBookings,
    now = new Date(),
  } = params;

  // Règle n°4 : Si le Mode Examens global est activé, aucun créneau n'est ouvert
  if (settings.examModeActive) {
    return [];
  }

  const dayOfWeek = getDakarDayOfWeek(dateKey);

  // Règle n°1 : Créneaux fixes hebdomadaires actifs pour ce jour
  const activeWindows = weeklySchedules
    .filter((w) => w.isActive && w.dayOfWeek === dayOfWeek)
    .sort(
      (a, b) =>
        parseTimeLabelToMinutes(a.startTime) -
        parseTimeLabelToMinutes(b.startTime)
    );

  if (activeWindows.length === 0) {
    return [];
  }

  // Règle n°2 : Délai minimum de réservation à l'avance (ex: 24h à 48h)
  const minNoticeMs = Math.max(0, settings.minNoticeHours) * 3_600_000;
  const earliestAllowedStartMs = now.getTime() + minNoticeMs;

  // Règle n°3 : Temps de nettoyage/préparation obligatoire après la pose
  const bufferMinutes = resolveEffectiveBufferMinutes(
    service.bufferMinutes,
    settings.defaultBufferMinutes
  );
  const stepMinutes = Math.max(15, settings.slotIntervalMinutes || 30);

  // Règle n°5 : Filtrer uniquement les réservations qui verrouillent réellement un créneau
  const blockingBookings = existingBookings.filter((b) =>
    isBookingBlockingSlot(b, now)
  );

  const availableSlots: ComputedSlot[] = [];
  const seenStartTimes = new Set<number>();

  for (const window of activeWindows) {
    const windowStartMin = parseTimeLabelToMinutes(window.startTime);
    const windowEndMin = parseTimeLabelToMinutes(window.endTime);

    for (
      let candidateStartMin = windowStartMin;
      candidateStartMin + service.durationMinutes <= windowEndMin;
      candidateStartMin += stepMinutes
    ) {
      const candidateEndMin = candidateStartMin + service.durationMinutes;
      const candidateBufferEndMin = candidateEndMin + bufferMinutes;

      const candidateStartAt = buildDakarDateTime(dateKey, candidateStartMin);
      const startMs = candidateStartAt.getTime();

      if (seenStartTimes.has(startMs)) {
        continue;
      }

      // Vérification Règle n°2 : Délai de prévenance (24h-48h)
      if (startMs < earliestAllowedStartMs) {
        continue;
      }

      const candidateEndAt = buildDakarDateTime(dateKey, candidateEndMin);
      const candidateBufferEndAt = buildDakarDateTime(
        dateKey,
        candidateBufferEndMin
      );

      // Vérification Règle n°4 : Périodes d'examens ou fermetures manuelles
      // La prestation ET son temps de préparation ne doivent chevaucher aucune fermeture
      const overlapsBlackout = blackoutPeriods.some((blackout) =>
        intervalsOverlap(
          candidateStartAt,
          candidateBufferEndAt,
          blackout.startAt,
          blackout.endAt
        )
      );

      if (overlapsBlackout) {
        continue;
      }

      // Vérification Règle n°5 : Blocage anti-doublon (pose + buffer inclus)
      const overlapsBooking = blockingBookings.some((booking) =>
        intervalsOverlap(
          candidateStartAt,
          candidateBufferEndAt,
          booking.startAt,
          booking.bufferEndAt
        )
      );

      if (overlapsBooking) {
        continue;
      }

      seenStartTimes.add(startMs);

      availableSlots.push({
        dateKey,
        startTimeLabel: formatMinutesToTimeLabel(candidateStartMin),
        endTimeLabel: formatMinutesToTimeLabel(candidateEndMin),
        bufferEndTimeLabel: formatMinutesToTimeLabel(candidateBufferEndMin),
        startAtIso: candidateStartAt.toISOString(),
        endAtIso: candidateEndAt.toISOString(),
        bufferEndAtIso: candidateBufferEndAt.toISOString(),
        durationMinutes: service.durationMinutes,
        bufferMinutes,
      });
    }
  }

  return availableSlots;
}

/**
 * Calcule le calendrier complet des disponibilités sur une fenêtre de `maxAdvanceDays` jours.
 */
export function computeAvailabilityCalendar(params: {
  startDateKey?: string;
  numberOfDays?: number;
  service: SlotEngineService;
  settings: SlotEngineSettings;
  weeklySchedules: readonly WeeklyTimeWindow[];
  blackoutPeriods: readonly TimeRangeBlock[];
  existingBookings: readonly ExistingBookingBlock[];
  now?: Date;
}): AvailabilityCalendarResult {
  const {
    service,
    settings,
    weeklySchedules,
    blackoutPeriods,
    existingBookings,
    now = new Date(),
  } = params;

  const baseDateKey = params.startDateKey ?? toDakarDateKey(now);
  const totalDays = Math.min(
    90,
    Math.max(1, params.numberOfDays ?? settings.maxAdvanceDays)
  );

  const days: DayAvailability[] = [];

  for (let offset = 0; offset < totalDays; offset += 1) {
    const currentDateKey = addDaysToDateKey(baseDateKey, offset);
    const dayOfWeek = getDakarDayOfWeek(currentDateKey);

    const slots = computeAvailableSlotsForDay({
      dateKey: currentDateKey,
      service,
      settings,
      weeklySchedules,
      blackoutPeriods,
      existingBookings,
      now,
    });

    days.push({
      dateKey: currentDateKey,
      dayOfWeek,
      isOpen: slots.length > 0,
      slots,
    });
  }

  return {
    examModeActive: settings.examModeActive,
    examModeMessage: settings.examModeMessage ?? null,
    timezone: DAKAR_TIMEZONE,
    minNoticeHours: settings.minNoticeHours,
    days,
  };
}

/**
 * Vérification atomique d'un créneau précis (utilisée juste avant la création d'un Booking en transaction).
 * Retourne l'objet `ComputedSlot` exact s'il est disponible, ou `null` s'il est indisponible/pris.
 */
export function verifySlotAvailability(params: {
  dateKey: string;
  startTimeLabel: string;
  service: SlotEngineService;
  settings: SlotEngineSettings;
  weeklySchedules: readonly WeeklyTimeWindow[];
  blackoutPeriods: readonly TimeRangeBlock[];
  existingBookings: readonly ExistingBookingBlock[];
  now?: Date;
}): ComputedSlot | null {
  const daySlots = computeAvailableSlotsForDay(params);
  return (
    daySlots.find((slot) => slot.startTimeLabel === params.startTimeLabel) ??
    null
  );
}

