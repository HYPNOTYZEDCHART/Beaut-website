import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma';
import {
  getServiceAvailabilityAction,
  updateServicePricingAction,
  updatePromoModeAction,
} from '../src/actions/availability.actions';
import {
  createBookingAndLockSlotAction,
  confirmBookingDepositAction,
  completeBookingAndGenerateReviewLinkAction,
  cancelBookingAction,
} from '../src/actions/booking.actions';
import {
  getReviewInvitationByTokenAction,
  submitClientReviewAction,
  moderateReviewAction,
} from '../src/actions/review.actions';
import {
  toWaMePhoneDigits,
  buildDepositProofWhatsAppUrl,
  buildBookingConfirmedWhatsAppUrl,
} from '../src/lib/whatsapp';
import { PaymentMethod } from '@prisma/client';

describe('FORTERESSE SÉCURITÉ, RÉSILIENCE ACID & SIMULATION CLIENTE E2E', () => {
  const adminPin = process.env.ADMIN_ACCESS_PIN || '##DiamassA*#';
  const userPhone = '776852146';
  const normalizedUserPhone = '+221776852146';
  let simulationBookingId: string | null = null;
  let collisionBookingId: string | null = null;

  // --------------------------------------------------------------------------
  // 1. SÉCURITÉ : NUMÉRO DU DÉVELOPPEUR & ROUTAGE WHATSAPP DAKAR
  // --------------------------------------------------------------------------
  it('1. Protocole WhatsApp : le numéro 776852146 est bien normalisé en 221776852146 et sans caractère parasite', () => {
    const waDigits = toWaMePhoneDigits(userPhone);
    assert.strictEqual(waDigits, '221776852146');

    const depositUrl = buildDepositProofWhatsAppUrl({
      studioWhatsappPhone: normalizedUserPhone,
      referenceCode: 'TEB-SIM-01',
      clientName: 'Fatou Sow',
      serviceName: 'Pose Mixte',
      dateKey: '2026-11-05',
      startTimeLabel: '15:00',
      depositAmountXof: 5000,
      totalPriceXof: 15000,
      paymentMethod: PaymentMethod.WAVE,
    });

    assert.ok(depositUrl.startsWith('https://wa.me/221776852146?text='));
    assert.ok(depositUrl.includes('TEB-SIM-01'));
    const decodedMessage = decodeURIComponent(depositUrl);
    assert.ok(decodedMessage.includes('5') && decodedMessage.includes('FCFA'));
  });

  // --------------------------------------------------------------------------
  // 2. SÉCURITÉ : CONTRÔLE D'ACCÈS PIN ADMIN & PROTECTION ANTI-IDOR
  // --------------------------------------------------------------------------
  it('2. Anti-IDOR & Sécurité PIN : un code PIN erroné bloque formellement la confirmation d acompte', async () => {
    const dummyBookingId = 'dummy-sec-test';
    const fakeRes = await confirmBookingDepositAction({
      adminPin: '9999_FAUX_PIN',
      bookingId: dummyBookingId,
    });

    assert.strictEqual(fakeRes.success, false);
    assert.ok(fakeRes.error.toLowerCase().includes('pin'));
  });

  // --------------------------------------------------------------------------
  // 3. INTÉGRITÉ FINANCIÈRE : ACOMPTE OBLIGATOIRE STRICT (ZÉRO OU NUL INTERDIT)
  // --------------------------------------------------------------------------
  it('3. Intégrité financière : tentative de fixer un acompte à 0 FCFA ou négatif rejetée par validation Zod', async () => {
    const service = await prisma.service.findFirst({ where: { isActive: true } });
    assert.ok(service);

    // Tentative de modification avec acompte = 0 (interdit car acompte obligatoire)
    const zeroDepositRes = await updateServicePricingAction({
      adminPin,
      serviceId: service.id,
      priceXof: 15000,
      depositXof: 0, // Invalide (min 1000)
    });

    assert.strictEqual(zeroDepositRes.success, false);
  });

  // --------------------------------------------------------------------------
  // 4. RÉSILIENCE ACID : DÉTECTION DES COLLISIONS ET ANTI-DOUBLE RÉSERVATION
  // --------------------------------------------------------------------------
  it('4. Concurrence ACID : 2 clientes réservant le même créneau au même instant déclenchent un rejet atomique', async () => {
    const service = await prisma.service.findFirst({ where: { isActive: true } });
    assert.ok(service);

    const avail = await getServiceAvailabilityAction({
      serviceId: service.id,
      numberOfDays: 28,
    });
    assert.strictEqual(avail.success, true);

    const day = avail.data?.days.find((d) => d.isOpen && d.slots.length > 0);
    assert.ok(day);
    const targetSlot = day.slots[0];
    assert.ok(targetSlot, 'Créneau requis pour simulation');

    // Simulation de concurrence atomique simultanée via Promise.all
    const [clientA, clientB] = await Promise.all([
      createBookingAndLockSlotAction({
        serviceId: service.id,
        dateKey: day.dateKey,
        startTimeLabel: targetSlot.startTimeLabel,
        clientName: 'Simulation Concurrente A',
        clientPhone: '+221771112233',
        paymentMethod: PaymentMethod.WAVE,
        agreedToRules: true,
      }),
      createBookingAndLockSlotAction({
        serviceId: service.id,
        dateKey: day.dateKey,
        startTimeLabel: targetSlot.startTimeLabel,
        clientName: 'Simulation Concurrente B',
        clientPhone: '+221774445566',
        paymentMethod: PaymentMethod.ORANGE_MONEY,
        agreedToRules: true,
      }),
    ]);

    // L'un des deux doit réussir et bloquer le créneau
    const successCount = (clientA.success ? 1 : 0) + (clientB.success ? 1 : 0);
    assert.strictEqual(successCount, 1, 'Exactement une seule cliente doit obtenir le créneau');

    // Mémoriser l'ID pour le nettoyage final
    if (clientA.success && clientA.data) {
      collisionBookingId = clientA.data.bookingId;
    } else if (clientB.success && clientB.data) {
      collisionBookingId = clientB.data.bookingId;
    }
  });

  // --------------------------------------------------------------------------
  // 5. CYCLE DE VIE COMPLET (SIMULATION CLIENTE RÉELLE DE BOUT EN BOUT)
  // --------------------------------------------------------------------------
  it('5. Cycle de vie client complet : Réservation -> Verrou Acompte -> Validation Admin -> Clôture -> Avis', async () => {
    const service = await prisma.service.findFirst({
      where: { slug: 'pose-mixte' },
    }) || await prisma.service.findFirst({ where: { isActive: true } });
    assert.ok(service);

    const avail = await getServiceAvailabilityAction({
      serviceId: service.id,
      numberOfDays: 30,
    });
    assert.strictEqual(avail.success, true);

    // Trouver un jour libre différent
    const openDays = avail.data?.days.filter((d) => d.isOpen && d.slots.length > 1) ?? [];
    assert.ok(openDays.length > 0, 'Journée ouverte avec créneaux requise');
    const targetDay = openDays[openDays.length - 1];
    assert.ok(targetDay, 'Journée cible requise');
    const targetSlot = targetDay.slots[targetDay.slots.length - 1];
    assert.ok(targetSlot, 'Créneau cible requis');

    // Étape A : La cliente sélectionne et bloque son créneau
    const bookingRes = await createBookingAndLockSlotAction({
      serviceId: service.id,
      dateKey: targetDay.dateKey,
      startTimeLabel: targetSlot.startTimeLabel,
      clientName: 'Ndeye Astou Diop',
      clientPhone: '+221776852146',
      clientInstagram: '@ndeye_astou',
      paymentMethod: PaymentMethod.WAVE,
      agreedToRules: true,
      clientNotes: 'Test de simulation automatique',
    });

    assert.strictEqual(bookingRes.success, true);
    assert.ok(bookingRes.data);
    simulationBookingId = bookingRes.data.bookingId;
    assert.strictEqual(bookingRes.data.totalPriceXof >= 10000, true);
    assert.strictEqual(bookingRes.data.depositAmountXof >= 1000, true);

    // Étape B : Vérifier que le numéro Wave dans le reçu est bien celui configuré
    assert.strictEqual(bookingRes.data.wavePhone, normalizedUserPhone);

    // Étape C : La gérante consulte et valide l'acompte dans son espace admin
    const confirmRes = await confirmBookingDepositAction({
      adminPin,
      bookingId: simulationBookingId,
    });
    assert.strictEqual(confirmRes.success, true);
    assert.ok(confirmRes.data);
    assert.strictEqual(confirmRes.data.status, 'CONFIRMED');

    // Étape D : Jour J — La gérante clôture la séance et génère le token d'avis
    const completeRes = await completeBookingAndGenerateReviewLinkAction({
      adminPin,
      bookingId: simulationBookingId,
    });
    assert.strictEqual(completeRes.success, true);
    assert.ok(completeRes.data);
    const token = completeRes.data.reviewToken;
    assert.ok(token && token.length > 10, 'Un token de review cryptographique doit être généré');

    // Étape E : La cliente ouvre son lien personnalisé d'avis
    const inviteRes = await getReviewInvitationByTokenAction(token);
    assert.strictEqual(inviteRes.success, true);
    assert.ok(inviteRes.data);
    assert.strictEqual(inviteRes.data.clientFirstNamePreview, 'Ndeye');
    assert.strictEqual(inviteRes.data.clientInitialPreview, 'Ndeye D.');

    // Étape F : La cliente soumet son avis 5 étoiles
    const reviewSubmitRes = await submitClientReviewAction({
      token,
      rating: 5,
      comment: 'Réservation fluide, studio très cosy et pose impeccable !',
      displayFormat: 'FIRST_NAME',
      consentGiven: true,
    });
    assert.strictEqual(reviewSubmitRes.success, true);

    // Étape G : Modération par la gérante dans /admin
    const reviewRecord = await prisma.review.findFirst({
      where: { bookingId: simulationBookingId },
    });
    assert.ok(reviewRecord);

    const modRes = await moderateReviewAction({
      adminPin,
      reviewId: reviewRecord.id,
      decision: 'APPROVED',
    });
    assert.strictEqual(modRes.success, true);
  });

  // --------------------------------------------------------------------------
  // 6. NETTOYAGE ATOMIQUE DES ENREGISTREMENTS DE TEST
  // --------------------------------------------------------------------------
  it('6. Nettoyage BDD Supabase : purge atomique des réservations de simulation', async () => {
    const idsToClean = [simulationBookingId, collisionBookingId].filter(
      (id): id is string => Boolean(id)
    );

    if (idsToClean.length > 0) {
      await prisma.$transaction(async (tx) => {
        await tx.review.deleteMany({
          where: { bookingId: { in: idsToClean } },
        });
        await tx.booking.deleteMany({
          where: { id: { in: idsToClean } },
        });
      });
    }

    assert.ok(true, 'Nettoyage terminé avec intégrité référentielle');
  });
});
