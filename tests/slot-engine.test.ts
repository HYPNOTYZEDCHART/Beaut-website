import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  intervalsOverlap,
  parseTimeLabelToMinutes,
  formatMinutesToTimeLabel,
  buildDakarDateTime,
  toDakarDateKey,
  toDakarTimeLabel,
  getDakarDayOfWeek,
  addDaysToDateKey,
  resolveEffectiveBufferMinutes,
  isBookingBlockingSlot,
  computeAvailableSlotsForDay,
  verifySlotAvailability,
  type SlotEngineService,
  type SlotEngineSettings,
  type WeeklyTimeWindow,
  type TimeRangeBlock,
  type ExistingBookingBlock,
} from '../src/lib/slot-engine';

describe('SLOT ENGINE — Moteur Mathématique de Créneaux (Africa/Dakar UTC+0)', () => {
  const baseService: SlotEngineService = {
    id: 'test-service-1',
    name: 'Pose Mixte',
    durationMinutes: 90, // 1h30
    bufferMinutes: 20, // 20 min
    priceXof: 25000,
    depositXof: 5000,
  };

  const baseSettings: SlotEngineSettings = {
    minNoticeHours: 24,
    defaultBufferMinutes: 20,
    slotHoldMinutes: 20,
    maxAdvanceDays: 30,
    slotIntervalMinutes: 30,
    examModeActive: false,
    examModeMessage: null,
  };

  // Mercredi (dayOfWeek: 3), Samedi (dayOfWeek: 6)
  const baseSchedules: WeeklyTimeWindow[] = [
    { dayOfWeek: 3, startTime: '10:00', endTime: '18:00', isActive: true }, // Mercredi
    { dayOfWeek: 6, startTime: '11:00', endTime: '19:00', isActive: true }, // Samedi
    { dayOfWeek: 0, startTime: '10:00', endTime: '18:00', isActive: false }, // Dimanche FERMÉ
  ];

  it('1. parseTimeLabelToMinutes & formatMinutesToTimeLabel convertissent avec exactitude', () => {
    assert.strictEqual(parseTimeLabelToMinutes('00:00'), 0);
    assert.strictEqual(parseTimeLabelToMinutes('10:30'), 630);
    assert.strictEqual(parseTimeLabelToMinutes('23:59'), 1439);
    assert.throws(() => parseTimeLabelToMinutes('24:00'), /Format d'heure invalide/);
    assert.throws(() => parseTimeLabelToMinutes('invalid'), /Format d'heure invalide/);

    assert.strictEqual(formatMinutesToTimeLabel(0), '00:00');
    assert.strictEqual(formatMinutesToTimeLabel(630), '10:30');
    assert.strictEqual(formatMinutesToTimeLabel(1439), '23:59');
  });

  it('2. intervalsOverlap détecte rigoureusement les chevauchements et exclut les bornes adjacentes', () => {
    const d1 = new Date('2026-10-25T10:00:00.000Z');
    const d2 = new Date('2026-10-25T11:30:00.000Z');
    const d3 = new Date('2026-10-25T11:30:00.000Z');
    const d4 = new Date('2026-10-25T13:00:00.000Z');
    const dOverlap = new Date('2026-10-25T11:00:00.000Z');

    // Bornes adjacentes [10:00, 11:30) et [11:30, 13:00) ne se chevauchent PAS
    assert.strictEqual(intervalsOverlap(d1, d2, d3, d4), false);
    // Chevauchement réel [10:00, 11:30) et [11:00, 13:00)
    assert.strictEqual(intervalsOverlap(d1, d2, dOverlap, d4), true);
  });

  it('3. resolveEffectiveBufferMinutes garantit le plancher strict de 15 minutes minimum', () => {
    assert.strictEqual(resolveEffectiveBufferMinutes(0, 20), 20);
    assert.strictEqual(resolveEffectiveBufferMinutes(10, 20), 15); // borné à 15 min minimum
    assert.strictEqual(resolveEffectiveBufferMinutes(30, 20), 30);
  });

  it('4. RÈGLE 1 : Jours fermés vs Jours ouverts selon le planning hebdomadaire', () => {
    // 2026-10-28 est un Mercredi (dayOfWeek: 3)
    const wednesdayDateKey = '2026-10-28';
    assert.strictEqual(getDakarDayOfWeek(wednesdayDateKey), 3);

    // 2026-10-26 est un Lundi (dayOfWeek: 1 - aucun schedule actif)
    const mondayDateKey = '2026-10-26';
    assert.strictEqual(getDakarDayOfWeek(mondayDateKey), 1);

    const nowFarInAdvance = new Date('2026-10-20T00:00:00.000Z');

    const slotsMonday = computeAvailableSlotsForDay({
      dateKey: mondayDateKey,
      service: baseService,
      settings: baseSettings,
      weeklySchedules: baseSchedules,
      blackoutPeriods: [],
      existingBookings: [],
      now: nowFarInAdvance,
    });
    assert.strictEqual(slotsMonday.length, 0, 'Le lundi doit avoir 0 créneau car non configuré');

    const slotsWednesday = computeAvailableSlotsForDay({
      dateKey: wednesdayDateKey,
      service: baseService,
      settings: baseSettings,
      weeklySchedules: baseSchedules,
      blackoutPeriods: [],
      existingBookings: [],
      now: nowFarInAdvance,
    });
    assert.ok(slotsWednesday.length > 0, 'Le mercredi doit avoir des créneaux disponibles');
    assert.strictEqual(slotsWednesday[0]?.startTimeLabel, '10:00');
  });

  it('5. RÈGLE 2 : Délai minimum de prévenance (24h / 48h)', () => {
    const dateKey = '2026-10-28'; // Mercredi
    // "Now" est le Mardi 27 octobre à 15:00 UTC
    // Avec minNoticeHours: 24, le créneau le plus tôt autorisé est le 28 octobre à 15:00 UTC
    const nowTuesday15h = new Date('2026-10-27T15:00:00.000Z');

    const slots = computeAvailableSlotsForDay({
      dateKey,
      service: baseService, // duration 90m
      settings: { ...baseSettings, minNoticeHours: 24 },
      weeklySchedules: baseSchedules, // 10h00 à 18h00
      blackoutPeriods: [],
      existingBookings: [],
      now: nowTuesday15h,
    });

    // Tous les créneaux avant 15:00 doivent être absents !
    for (const slot of slots) {
      const slotStartMinutes = parseTimeLabelToMinutes(slot.startTimeLabel);
      assert.ok(
        slotStartMinutes >= 15 * 60,
        `Le créneau ${slot.startTimeLabel} devrait être après 15:00 en respectant les 24h de prévenance`
      );
    }
  });

  it('6. RÈGLE 3 & 6 : Buffer hygiène et respect strict de l heure de fermeture du studio', () => {
    // Mercredi 10:00 à 18:00 (baseSchedules)
    // Pose Mixte : 90 min (1h30)
    // Dernier créneau possible : start + 90 min <= 18:00 -> 16:30 + 90min = 18:00 pile.
    // 17:00 est impossible car 17:00 + 90min = 18:30 > 18:00.
    const dateKey = '2026-10-28';
    const slots = computeAvailableSlotsForDay({
      dateKey,
      service: baseService,
      settings: baseSettings,
      weeklySchedules: baseSchedules,
      blackoutPeriods: [],
      existingBookings: [],
      now: new Date('2026-10-20T00:00:00.000Z'),
    });

    const lastSlot = slots[slots.length - 1];
    assert.strictEqual(lastSlot?.startTimeLabel, '16:30');
    assert.strictEqual(lastSlot?.endTimeLabel, '18:00');
    assert.strictEqual(lastSlot?.bufferEndTimeLabel, '18:20');
  });

  it('7. RÈGLE 4 : Période de Blackout / Mode Examens', () => {
    const dateKey = '2026-10-28';
    // Test A : Mode Examen Global activé
    const examSlots = computeAvailableSlotsForDay({
      dateKey,
      service: baseService,
      settings: { ...baseSettings, examModeActive: true, examModeMessage: 'Période examens' },
      weeklySchedules: baseSchedules,
      blackoutPeriods: [],
      existingBookings: [],
      now: new Date('2026-10-20T00:00:00.000Z'),
    });
    assert.strictEqual(examSlots.length, 0, 'En mode examen, aucun créneau ne doit être renvoyé');

    // Test B : Blackout ciblé de 13:00 à 16:00
    const blackoutPeriod: TimeRangeBlock = {
      id: 'blackout-1',
      startAt: new Date('2026-10-28T13:00:00.000Z'),
      endAt: new Date('2026-10-28T16:00:00.000Z'),
      title: 'Révisions',
    };

    const slotsWithBlackout = computeAvailableSlotsForDay({
      dateKey,
      service: baseService,
      settings: baseSettings,
      weeklySchedules: baseSchedules,
      blackoutPeriods: [blackoutPeriod],
      existingBookings: [],
      now: new Date('2026-10-20T00:00:00.000Z'),
    });

    // Aucun créneau chevauchant 13:00-16:00 (pose + 20min buffer) ne doit être présent
    for (const slot of slotsWithBlackout) {
      const slotStart = new Date(slot.startAtIso);
      const slotBufferEnd = new Date(slot.bufferEndAtIso);
      const overlaps = intervalsOverlap(slotStart, slotBufferEnd, blackoutPeriod.startAt, blackoutPeriod.endAt);
      assert.strictEqual(overlaps, false, `Le créneau ${slot.startTimeLabel} chevauche le blackout`);
    }
  });

  it('8. RÈGLE 5 : Collision et Verrou Anti-Double-Réservation', () => {
    const dateKey = '2026-10-28';
    // Une cliente a réservé de 10:00 à 11:30, avec buffer jusqu'à 11:50
    const existingConfirmedBooking: ExistingBookingBlock = {
      id: 'booking-existing-1',
      status: 'CONFIRMED',
      startAt: new Date('2026-10-28T10:00:00.000Z'),
      endAt: new Date('2026-10-28T11:30:00.000Z'),
      bufferEndAt: new Date('2026-10-28T11:50:00.000Z'),
      lockedUntil: null,
    };

    const slots = computeAvailableSlotsForDay({
      dateKey,
      service: baseService,
      settings: baseSettings,
      weeklySchedules: baseSchedules,
      blackoutPeriods: [],
      existingBookings: [existingConfirmedBooking],
      now: new Date('2026-10-20T00:00:00.000Z'),
    });

    // 10:00, 10:30, 11:00, 11:30 (chevauche le buffer jusqu'à 11:50) doivent être exclus !
    // Le premier créneau libre doit être 12:00 !
    assert.strictEqual(slots[0]?.startTimeLabel, '12:00');
  });

  it('9. isBookingBlockingSlot gère l expiration des verrous PENDING_DEPOSIT', () => {
    const now = new Date('2026-10-22T10:00:00.000Z');

    const lockActive: ExistingBookingBlock = {
      id: 'b1',
      status: 'PENDING_DEPOSIT',
      startAt: new Date('2026-10-25T10:00:00.000Z'),
      endAt: new Date('2026-10-25T11:30:00.000Z'),
      bufferEndAt: new Date('2026-10-25T11:50:00.000Z'),
      lockedUntil: new Date('2026-10-22T10:15:00.000Z'), // Expiration dans 15 min
    };
    assert.strictEqual(isBookingBlockingSlot(lockActive, now), true, 'Le verrou actif doit bloquer');

    const lockExpired: ExistingBookingBlock = {
      id: 'b2',
      status: 'PENDING_DEPOSIT',
      startAt: new Date('2026-10-25T10:00:00.000Z'),
      endAt: new Date('2026-10-25T11:30:00.000Z'),
      bufferEndAt: new Date('2026-10-25T11:50:00.000Z'),
      lockedUntil: new Date('2026-10-22T09:55:00.000Z'), // Expiré il y a 5 min
    };
    assert.strictEqual(isBookingBlockingSlot(lockExpired, now), false, 'Le verrou expiré ne doit plus bloquer');

    const cancelled: ExistingBookingBlock = {
      id: 'b3',
      status: 'CANCELLED',
      startAt: new Date('2026-10-25T10:00:00.000Z'),
      endAt: new Date('2026-10-25T11:30:00.000Z'),
      bufferEndAt: new Date('2026-10-25T11:50:00.000Z'),
      lockedUntil: null,
    };
    assert.strictEqual(isBookingBlockingSlot(cancelled, now), false, 'Une réservation annulée ne bloque pas');
  });
});
