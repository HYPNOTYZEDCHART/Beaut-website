import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma';

describe('SUPABASE ORM & BASE DE DONNÉES — Audit d Intégrité et Connexion Active', () => {
  it('1. Connexion en direct à la base Supabase PostgreSQL distante', async () => {
    const rawResult = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now;`;
    assert.ok(rawResult.length > 0, 'La requête SELECT NOW() doit retourner un résultat');
    assert.ok(rawResult[0]?.now instanceof Date, 'Le champ now doit être une Date valide');
  });

  it('2. Table StudioSettings : présence et intégrité de la configuration gérante', async () => {
    const settings = await prisma.studioSettings.findFirst();
    assert.ok(settings !== null, 'StudioSettings doit exister dans Supabase');
    assert.strictEqual(typeof settings.studioName, 'string');
    assert.ok(settings.studioName.length > 0);
    assert.ok(settings.minNoticeHours >= 12, 'minNoticeHours doit être >= 12h');
    assert.ok(settings.defaultBufferMinutes >= 15, 'defaultBufferMinutes doit être >= 15 min');
    assert.ok(settings.slotHoldMinutes >= 10, 'slotHoldMinutes doit être >= 10 min');
    assert.strictEqual(typeof settings.exactAddress, 'string');
    assert.ok(settings.exactAddress.length > 5, 'exactAddress doit être présente');
    assert.ok(settings.wavePhone.length >= 9, 'wavePhone doit être présent');
    assert.ok(settings.orangeMoneyPhone.length >= 9, 'orangeMoneyPhone doit être présent');
  });

  it('3. Table Service : catalogue complet avec prix FCFA entiers et durées cohérentes', async () => {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    });
    assert.ok(services.length >= 5, 'Le catalogue doit comporter au moins 5 prestations');

    for (const service of services) {
      assert.ok(service.name.length > 0);
      assert.ok(service.durationMinutes >= 30, `La durée de ${service.name} doit être >= 30 min`);
      assert.ok(service.bufferMinutes >= 15, `Le buffer de ${service.name} doit être >= 15 min`);
      assert.ok(service.priceXof > 0, `Le prix de ${service.name} doit être positif`);
      assert.ok(service.depositXof > 0, `L acompte de ${service.name} doit être positif`);
      assert.ok(service.depositXof < service.priceXof, `L acompte doit être strictement inférieur au prix total`);
      // Vérification FinTech : Zéro virgule flottante
      assert.strictEqual(Number.isInteger(service.priceXof), true);
      assert.strictEqual(Number.isInteger(service.depositXof), true);
    }
  });

  it('4. Table WeeklySchedule : fenêtres horaires conformes', async () => {
    const schedules = await prisma.weeklySchedule.findMany({
      where: { isActive: true },
    });
    assert.ok(schedules.length >= 1, 'Au moins un jour de travail doit être actif');

    for (const schedule of schedules) {
      assert.ok(schedule.dayOfWeek >= 0 && schedule.dayOfWeek <= 6);
      assert.match(schedule.startTime, /^([01]\d|2[0-3]):([0-5]\d)$/);
      assert.match(schedule.endTime, /^([01]\d|2[0-3]):([0-5]\d)$/);
      assert.ok(schedule.startTime < schedule.endTime, 'L heure de début doit précéder l heure de fin');
    }
  });

  it('5. Table Booking : contraintes d intégrité et unicité des slotLockKey', async () => {
    const bookings = await prisma.booking.findMany({
      take: 10,
      include: { service: true },
    });

    for (const booking of bookings) {
      assert.ok(booking.referenceCode.startsWith('TEB-'));
      assert.ok(booking.clientName.length > 0);
      assert.ok(booking.clientPhone.length > 0);
      assert.ok(booking.service !== null, 'La réservation doit être liée à un service existant');
      assert.ok(booking.startAt < booking.endAt, 'startAt doit précéder endAt');
      assert.ok(booking.endAt <= booking.bufferEndAt, 'endAt doit précéder ou égaler bufferEndAt');
      assert.strictEqual(Number.isInteger(booking.totalPriceXof), true);
      assert.strictEqual(Number.isInteger(booking.depositAmountXof), true);
    }
  });

  it('6. Table Review : avis clients et validation des statuts de modération', async () => {
    const reviews = await prisma.review.findMany();
    for (const review of reviews) {
      assert.ok(review.token.length > 10, 'Le token d avis doit être généré');
      assert.ok(review.serviceNameSnap.length > 0);
      if (review.rating !== null) {
        assert.ok(review.rating >= 1 && review.rating <= 5, 'La note doit être comprise entre 1 et 5');
      }
      assert.ok(
        ['INVITED', 'PENDING_MODERATION', 'APPROVED', 'REJECTED'].includes(review.moderationStatus),
        'Statut de modération valide'
      );
    }
  });
});
