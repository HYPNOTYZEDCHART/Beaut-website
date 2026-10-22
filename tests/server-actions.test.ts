import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma';
import {
  createBlackoutPeriodAction,
  deleteBlackoutPeriodAction,
  getServiceAvailabilityAction,
  listBlackoutPeriodsAction,
} from '../src/actions/availability.actions';
import {
  createBookingAndLockSlotAction,
  confirmBookingDepositAction,
  completeBookingAndGenerateReviewLinkAction,
} from '../src/actions/booking.actions';
import {
  getReviewInvitationByTokenAction,
  submitClientReviewAction,
} from '../src/actions/review.actions';
import { PaymentMethod } from '@prisma/client';

describe('SERVER ACTIONS & TRANSACTION ACID — Cycle de Vie Complet Réservation & Avis', () => {
  let createdTestBookingId: string | null = null;
  const adminPin = process.env.ADMIN_ACCESS_PIN || '1234';

  it('1. getServiceAvailabilityAction calcule la disponibilité réelle sur Supabase', async () => {
    const service = await prisma.service.findFirst({
      where: { isActive: true },
    });
    assert.ok(service, 'Un service actif doit exister');

    const result = await getServiceAvailabilityAction({
      serviceId: service.id,
      numberOfDays: 14,
    });

    assert.strictEqual(result.success, true);
    assert.ok(result.data, 'Des données de calendrier doivent être retournées');
    assert.strictEqual(result.data.timezone, 'Africa/Dakar');
    assert.ok(result.data.days.length >= 7, 'Au moins 7 jours calculés');

    // Trouver un jour avec au moins 1 créneau libre
    const dayWithSlots = result.data.days.find((d) => d.isOpen && d.slots.length > 0);
    assert.ok(dayWithSlots, 'Il doit exister au moins une journée ouverte avec des créneaux');
  });

  it('2. createBookingAndLockSlotAction réserve et verrouille un créneau en transaction Serializable', async () => {
    const service = await prisma.service.findFirst({
      where: { isActive: true },
    });
    assert.ok(service);

    const availResult = await getServiceAvailabilityAction({
      serviceId: service.id,
      numberOfDays: 21,
    });
    assert.strictEqual(availResult.success, true);

    // Choisir un créneau au moins 48h dans le futur
    const candidateDay = availResult.data?.days.find(
      (d) => d.isOpen && d.slots.length > 2
    );
    assert.ok(candidateDay, 'Un jour avec plusieurs créneaux doit être disponible');

    const candidateSlot = candidateDay.slots[0]; // Premier créneau libre
    assert.ok(candidateSlot);

    const bookingResult = await createBookingAndLockSlotAction({
      serviceId: service.id,
      dateKey: candidateSlot.dateKey,
      startTimeLabel: candidateSlot.startTimeLabel,
      clientName: 'Audit Test Client',
      clientPhone: '+221 77 000 99 88',
      paymentMethod: PaymentMethod.WAVE,
      agreedToRules: true,
      clientNotes: 'Test unitaire automatisé - audit',
    });

    if (!bookingResult.success) {
      assert.fail(`Erreur réservation: ${bookingResult.error}`);
    }
    assert.strictEqual(bookingResult.success, true);
    assert.ok(bookingResult.data);
    assert.ok(bookingResult.data.bookingId);
    assert.ok(bookingResult.data.referenceCode.startsWith('TEB-'));
    assert.strictEqual(bookingResult.data.dateKey, candidateSlot.dateKey);
    assert.strictEqual(bookingResult.data.startTimeLabel, candidateSlot.startTimeLabel);
    assert.ok(bookingResult.data.whatsappDepositProofUrl.includes('wa.me'));

    createdTestBookingId = bookingResult.data.bookingId;

    // 3. Collision anti-doublon : une deuxième réservation sur CE MÊME créneau doit être rejetée !
    const duplicateResult = await createBookingAndLockSlotAction({
      serviceId: service.id,
      dateKey: candidateSlot.dateKey,
      startTimeLabel: candidateSlot.startTimeLabel,
      clientName: 'Imposteur Double-Booking',
      clientPhone: '+221 78 111 22 33',
      paymentMethod: PaymentMethod.WAVE,
      agreedToRules: true,
    });

    assert.strictEqual(duplicateResult.success, false, 'La réservation concurrente doit échouer');
    assert.match(
      duplicateResult.error ?? '',
      /Ce créneau vient tout juste d’être réservé|n’est plus disponible/,
      'Message d erreur explicite sur le créneau déjà pris'
    );
  });

  it('3. Fermeture rapide de créneau (Blackout), liste et réouverture immédiate', async () => {
    // 1. Créer une fermeture manuelle pour un créneau test
    const blockRes = await createBlackoutPeriodAction({
      adminPin,
      title: 'Révisions Urgentes Test',
      type: 'MANUAL_BLOCK',
      startAtIso: '2026-11-15T14:30:00.000Z',
      endAtIso: '2026-11-15T19:30:00.000Z',
      isAllDay: false,
    });
    assert.strictEqual(blockRes.success, true);
    assert.ok(blockRes.data.id);

    // 2. Vérifier que la fermeture apparaît dans listBlackoutPeriodsAction
    const listRes = await listBlackoutPeriodsAction({ adminPin });
    assert.strictEqual(listRes.success, true);
    const found = listRes.data.find((b) => b.id === blockRes.data.id);
    assert.ok(found, 'La fermeture doit être listée pour la gérante');
    assert.strictEqual(found.title, 'Révisions Urgentes Test');

    // 3. Rouvrir le créneau (suppression de la fermeture)
    const delRes = await deleteBlackoutPeriodAction({
      adminPin,
      blackoutId: blockRes.data.id,
    });
    assert.strictEqual(delRes.success, true);

    // 4. Vérifier que la fermeture n'apparaît plus
    const listAfterRes = await listBlackoutPeriodsAction({ adminPin });
    assert.strictEqual(listAfterRes.success, true);
    assert.strictEqual(
      listAfterRes.data.some((b) => b.id === blockRes.data.id),
      false
    );
  });

  it('4. confirmBookingDepositAction : sécurité PIN admin et confirmation d acompte', async () => {
    assert.ok(createdTestBookingId, 'Booking ID de test requis');

    // Test A : Rejet avec mauvais code PIN
    const failPinResult = await confirmBookingDepositAction({
      bookingId: createdTestBookingId,
      adminPin: '999999', // Faux PIN
    });
    assert.strictEqual(failPinResult.success, false);
    assert.match(failPinResult.error ?? '', /Code PIN praticienne invalide/);

    // Test B : Succès avec bon code PIN
    const successResult = await confirmBookingDepositAction({
      bookingId: createdTestBookingId,
      adminPin,
    });
    assert.strictEqual(successResult.success, true);
    assert.ok(successResult.data);
    assert.ok(
      decodeURIComponent(successResult.data.clientConfirmationWhatsAppUrl).includes('GM-01') ||
      decodeURIComponent(successResult.data.clientConfirmationWhatsAppUrl).includes('Grand Médine')
    );
  });

  it('5. completeBookingAndGenerateReviewLinkAction et soumission d avis via token', async () => {
    assert.ok(createdTestBookingId, 'Booking ID de test requis');

    // 1. Clôture de la prestation et génération du jeton d'avis
    const completeResult = await completeBookingAndGenerateReviewLinkAction({
      bookingId: createdTestBookingId,
      adminPin,
    });
    assert.strictEqual(completeResult.success, true);
    assert.ok(completeResult.data);
    assert.ok(completeResult.data.reviewToken.length > 10);
    assert.ok(completeResult.data.reviewInviteWhatsAppUrl.includes(completeResult.data.reviewToken));

    const token = completeResult.data.reviewToken;

    // 2. Consultation publique de l'invitation /avis/[token]
    const inviteResult = await getReviewInvitationByTokenAction(token);
    assert.strictEqual(inviteResult.success, true);
    assert.ok(inviteResult.data);
    assert.strictEqual(inviteResult.data.alreadySubmitted, false);
    assert.strictEqual(inviteResult.data.isExpired, false);

    // 3. Soumission d'un avis client avec note 5 et accord
    const submitResult = await submitClientReviewAction({
      token,
      rating: 5,
      comment: 'Pose magnifique, tenue impeccable et studio très apaisant !',
      displayFormat: 'FIRST_NAME',
      consentGiven: true,
    });
    assert.strictEqual(submitResult.success, true);

    // 4. Tentative de resoumission avec le même jeton -> Doit être refusée
    const reSubmitResult = await submitClientReviewAction({
      token,
      rating: 4,
      comment: 'Deuxième tentative',
      displayFormat: 'FIRST_NAME',
      consentGiven: true,
    });
    assert.strictEqual(reSubmitResult.success, false);
    assert.match(reSubmitResult.error ?? '', /déjà été enregistré/);
  });

  // Nettoyage après test
  it('6. Cleanup : Nettoyage atomique des données de test dans Supabase', async () => {
    if (createdTestBookingId) {
      await prisma.booking.delete({
        where: { id: createdTestBookingId },
      });
      const check = await prisma.booking.findUnique({
        where: { id: createdTestBookingId },
      });
      assert.strictEqual(check, null, 'Le booking de test doit être supprimé de Supabase');
    }
  });
});
