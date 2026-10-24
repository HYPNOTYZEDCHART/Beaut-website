import 'dotenv/config';
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { prisma } from '../src/lib/prisma';
import {
  getCatalogAndSettingsAction,
  getServiceAvailabilityAction,
  createBlackoutPeriodAction,
  deleteBlackoutPeriodAction,
  listBlackoutPeriodsAction,
  updateServicePricingAction,
  updatePromoModeAction,
  toggleExamModeAction,
} from '../src/actions/availability.actions';
import {
  createBookingAndLockSlotAction,
  markDepositSubmittedWhatsappAction,
  getBookingConfirmationDetailsAction,
  listAdminBookingsAction,
  confirmBookingDepositAction,
  completeBookingAndGenerateReviewLinkAction,
} from '../src/actions/booking.actions';
import {
  getReviewInvitationByTokenAction,
  submitClientReviewAction,
  listAdminReviewsAction,
  moderateReviewAction,
} from '../src/actions/review.actions';
import { PaymentMethod, BlackoutType } from '@prisma/client';

describe('🚀 GRAND TEST D’INTÉGRATION E2E — PARCOURS CLIENTE, BACK-OFFICE DIAMA & CYCLE COMPLET', () => {
  const adminPin = process.env.ADMIN_ACCESS_PIN || '##DiamassA*#';
  let testServiceId: string;
  let testServiceName: string;
  let originalPriceXof: number;
  let originalDepositXof: number;
  let testDateKey: string;
  let testStartTimeLabel: string;
  let testBookingId: string;
  let testReferenceCode: string;
  let testReviewToken: string;
  let testReviewId: string;
  let testBlackoutId: string;

  // =========================================================================
  // ÉTAPE 1 : PARCOURS CLIENTE — CONSULTATION ET RÉSERVATION 7J/7
  // =========================================================================
  it('1. Cliente : Consultation du catalogue des 5 poses et paramètres publics', async () => {
    const catalogRes = await getCatalogAndSettingsAction();
    assert.strictEqual(catalogRes.success, true);
    assert.ok(catalogRes.data.services.length >= 5, 'Au moins 5 poses doivent être disponibles');
    
    const activeService = catalogRes.data.services[0];
    assert.ok(activeService, 'Au moins une pose requise');
    testServiceId = activeService.id;
    testServiceName = activeService.name;
    originalPriceXof = activeService.priceXof;
    originalDepositXof = activeService.depositXof;

    assert.ok(originalPriceXof > 0, 'Prix FCFA doit être positif');
    assert.ok(originalDepositXof > 0, 'Acompte FCFA doit être positif');
  });

  it('2. Cliente : Calcul des créneaux ouverts 7j/7 en temps réel (Dakar UTC+0)', async () => {
    const availRes = await getServiceAvailabilityAction({
      serviceId: testServiceId,
      numberOfDays: 28,
    });
    assert.strictEqual(availRes.success, true);
    assert.ok(availRes.data);
    assert.strictEqual(availRes.data.timezone, 'Africa/Dakar');

    // Trouver un jour futur avec des créneaux ouverts
    const candidateDay = availRes.data.days.find(
      (d) => d.isOpen && d.slots.length > 2
    );
    assert.ok(candidateDay, 'Un jour futur ouvert avec créneaux est requis');
    const firstSlot = candidateDay.slots[0];
    assert.ok(firstSlot, 'Un premier créneau est requis');
    testDateKey = candidateDay.dateKey;
    testStartTimeLabel = firstSlot.startTimeLabel;
  });

  it('3. Cliente : Réservation & Verrouillage atomique du créneau avec Wave', async () => {
    const bookRes = await createBookingAndLockSlotAction({
      serviceId: testServiceId,
      dateKey: testDateKey,
      startTimeLabel: testStartTimeLabel,
      clientName: 'Fatou Binetou Ndiaye (Test E2E)',
      clientPhone: '+221 77 654 32 10',
      clientNotes: 'Pose Cil à Cil test automatisé studio Diama',
      paymentMethod: PaymentMethod.WAVE,
      agreedToRules: true,
    });

    if (!bookRes.success) {
      assert.fail(`Erreur createBookingAndLockSlotAction: ${bookRes.error}`);
    }
    assert.strictEqual(bookRes.success, true);
    assert.ok(bookRes.data);
    testBookingId = bookRes.data.bookingId;
    testReferenceCode = bookRes.data.referenceCode;
    assert.ok(testReferenceCode.length >= 6, 'Code référence requis');
    assert.ok(bookRes.data.whatsappDepositProofUrl.includes('wa.me'), 'Lien WhatsApp pré-rempli');

    // Vérifier en BDD que le créneau est bien verrouillé (anti-doublon)
    const bookingInDb = await prisma.booking.findUnique({
      where: { id: testBookingId },
    });
    assert.ok(bookingInDb);
    assert.strictEqual(bookingInDb.status, 'PENDING_DEPOSIT');
    assert.ok(bookingInDb.lockedUntil && bookingInDb.lockedUntil > new Date());
  });

  it('4. Cliente : Confirmation d envoi de l acompte sans capture obligatoire', async () => {
    const confirmSendRes = await markDepositSubmittedWhatsappAction({
      bookingId: testBookingId,
      referenceCode: testReferenceCode,
    });
    if (!confirmSendRes.success) {
      assert.fail(`Erreur markDepositSubmitted: ${confirmSendRes.error}`);
    }
    assert.strictEqual(confirmSendRes.success, true);
    assert.strictEqual(confirmSendRes.data.bookingId, testBookingId);
    assert.ok(confirmSendRes.data.whatsappDepositProofUrl.includes(testReferenceCode));

    // Consultation de l écran de confirmation final
    const detailsRes = await getBookingConfirmationDetailsAction({
      bookingId: testBookingId,
      referenceCode: testReferenceCode,
    });
    assert.strictEqual(detailsRes.success, true);
    assert.strictEqual(detailsRes.data.referenceCode, testReferenceCode);
    assert.strictEqual(detailsRes.data.serviceName, testServiceName);
  });

  // =========================================================================
  // ÉTAPE 2 : RÔLE DIAMA — GESTION DES RENDEZ-VOUS (ONGLET 1)
  // =========================================================================
  it('5. Diama (Admin) : Déverrouillage PIN et affichage des acomptes en attente', async () => {
    const listRes = await listAdminBookingsAction({
      adminPin,
      page: 1,
      limit: 20,
    });
    if (!listRes.success) {
      assert.fail(`Erreur listAdminBookingsAction: ${listRes.error}`);
    }
    assert.strictEqual(listRes.success, true);
    const target = listRes.data.data.find((b) => b.id === testBookingId);
    assert.ok(target, 'Le rendez-vous test doit apparaître dans la liste gérante');
    assert.strictEqual(target.status, 'PENDING_DEPOSIT');
  });

  it('6. Diama (Admin) : Validation de l acompte en 1 clic après vérification Wave', async () => {
    const confirmDepositRes = await confirmBookingDepositAction({
      adminPin,
      bookingId: testBookingId,
    });
    if (!confirmDepositRes.success) {
      assert.fail(`Erreur confirmBookingDepositAction: ${confirmDepositRes.error}`);
    }
    assert.strictEqual(confirmDepositRes.success, true);
    assert.strictEqual(confirmDepositRes.data.bookingId, testBookingId);
    assert.ok(confirmDepositRes.data.clientConfirmationWhatsAppUrl.includes(testReferenceCode));

    // Vérifier le passage en CONFIRMED dans Supabase
    const confirmedBooking = await prisma.booking.findUnique({
      where: { id: testBookingId },
    });
    assert.strictEqual(confirmedBooking?.status, 'CONFIRMED');
    assert.strictEqual(confirmedBooking?.depositStatus, 'CONFIRMED');
  });

  it('7. Diama (Admin) : Clôture de prestation et génération du lien d avis', async () => {
    const completeRes = await completeBookingAndGenerateReviewLinkAction({
      adminPin,
      bookingId: testBookingId,
    });
    if (!completeRes.success) {
      assert.fail(`Erreur completeBookingAction: ${completeRes.error}`);
    }
    assert.strictEqual(completeRes.success, true);
    assert.strictEqual(completeRes.data.bookingId, testBookingId);
    assert.ok(completeRes.data.reviewToken, 'Un token de review unique doit être généré');
    testReviewToken = completeRes.data.reviewToken;
    assert.ok(completeRes.data.reviewInviteWhatsAppUrl.includes(testReviewToken));

    const completedBooking = await prisma.booking.findUnique({
      where: { id: testBookingId },
    });
    assert.strictEqual(completedBooking?.status, 'COMPLETED');
  });

  // =========================================================================
  // ÉTAPE 3 : PARCOURS CLIENTE POST-PRESTATION — DÉPÔT D'AVIS VÉRIFIÉ
  // =========================================================================
  it('8. Cliente : Accès au formulaire d avis personnalisé via le lien WhatsApp', async () => {
    const inviteRes = await getReviewInvitationByTokenAction(testReviewToken);
    if (!inviteRes.success) {
      assert.fail(`Erreur getReviewInvitationByTokenAction: ${inviteRes.error}`);
    }
    assert.strictEqual(inviteRes.success, true);
    assert.strictEqual(inviteRes.data.token, testReviewToken);
    assert.strictEqual(inviteRes.data.serviceName, testServiceName);
    assert.strictEqual(inviteRes.data.alreadySubmitted, false);
  });

  it('9. Cliente : Soumission d un avis 5 étoiles avec note et commentaire', async () => {
    const submitRes = await submitClientReviewAction({
      token: testReviewToken,
      rating: 5,
      comment: 'Superbe pose cil à cil, tenue parfaite et studio très propre !',
      displayFormat: 'FIRST_NAME_INITIAL',
      consentGiven: true,
    });
    if (!submitRes.success) {
      assert.fail(`Erreur submitClientReviewAction: ${submitRes.error}`);
    }
    assert.strictEqual(submitRes.success, true);
    testReviewId = submitRes.data.reviewId;
    assert.ok(testReviewId);

    // Vérifier l enregistrement dans Supabase
    const reviewInDb = await prisma.review.findUnique({
      where: { id: testReviewId },
    });
    assert.ok(reviewInDb);
    assert.strictEqual(reviewInDb.rating, 5);
  });

  it('10. Diama (Admin) : Modération et publication de l avis client', async () => {
    const modRes = await moderateReviewAction({
      adminPin,
      reviewId: testReviewId,
      decision: 'APPROVED',
    });
    if (!modRes.success) {
      assert.fail(`Erreur moderateReviewAction: ${modRes.error}`);
    }
    assert.strictEqual(modRes.success, true);
    assert.strictEqual(modRes.data.status, 'APPROVED');
  });

  // =========================================================================
  // ÉTAPE 4 : RÔLE DIAMA — TARIFS & PROMOTIONS (ONGLET 2)
  // =========================================================================
  it('11. Diama (Admin) : Modification immédiate d un tarif et acompte en FCFA', async () => {
    const newPrice = originalPriceXof + 2500;
    const newDeposit = originalDepositXof + 1000;

    const updatePriceRes = await updateServicePricingAction({
      adminPin,
      serviceId: testServiceId,
      priceXof: newPrice,
      depositXof: newDeposit,
    });
    if (!updatePriceRes.success) {
      assert.fail(`Erreur updateServicePricingAction: ${updatePriceRes.error}`);
    }
    assert.strictEqual(updatePriceRes.success, true);
    assert.strictEqual(updatePriceRes.data.priceXof, newPrice);
    assert.strictEqual(updatePriceRes.data.depositXof, newDeposit);

    // Vérifier la répercussion en direct dans Supabase
    const updatedSrv = await prisma.service.findUnique({
      where: { id: testServiceId },
    });
    assert.strictEqual(updatedSrv?.priceXof, newPrice);

    // Restaurer le tarif initial
    await updateServicePricingAction({
      adminPin,
      serviceId: testServiceId,
      priceXof: originalPriceXof,
      depositXof: originalDepositXof,
    });
  });

  it('12. Diama (Admin) : Activation & Désactivation du mode Promotion', async () => {
    // Activer la promo
    const promoOnRes = await updatePromoModeAction({
      adminPin,
      active: true,
      promoPriceXof: 15000,
      promoBannerMessage: 'Offre Spéciale : 15 000 FCFA sur toutes les poses !',
    });
    if (!promoOnRes.success) {
      assert.fail(`Erreur updatePromoModeAction (ON): ${promoOnRes.error}`);
    }
    assert.strictEqual(promoOnRes.success, true);
    assert.strictEqual(promoOnRes.data.promoModeActive, true);

    // Désactiver la promo
    const promoOffRes = await updatePromoModeAction({
      adminPin,
      active: false,
    });
    if (!promoOffRes.success) {
      assert.fail(`Erreur updatePromoModeAction (OFF): ${promoOffRes.error}`);
    }
    assert.strictEqual(promoOffRes.success, true);
    assert.strictEqual(promoOffRes.data.promoModeActive, false);
  });

  // =========================================================================
  // ÉTAPE 5 : RÔLE DIAMA — PLANNING & FERMETURE RAPIDE (ONGLET 3)
  // =========================================================================
  it('13. Diama (Admin) : Blocage d urgence d un jour (Blackout / Absence)', async () => {
    const startAtIso = new Date('2026-11-20T09:30:00.000Z').toISOString();
    const endAtIso = new Date('2026-11-20T19:30:00.000Z').toISOString();
    const blockRes = await createBlackoutPeriodAction({
      adminPin,
      title: 'Journée fermée pour formation esthétique',
      type: BlackoutType.MANUAL_BLOCK,
      startAtIso,
      endAtIso,
      isAllDay: true,
      reason: 'Formation Diama',
    });
    if (!blockRes.success) {
      assert.fail(`Erreur createBlackoutPeriodAction: ${blockRes.error}`);
    }
    assert.strictEqual(blockRes.success, true);
    testBlackoutId = blockRes.data.id;
    assert.ok(testBlackoutId);

    // Vérifier que la date est bien listée dans l admin
    const listBlockRes = await listBlackoutPeriodsAction({ adminPin });
    assert.strictEqual(listBlockRes.success, true);
    assert.ok(listBlockRes.data.some((b) => b.id === testBlackoutId));

    // Vérifier que le moteur de créneaux public a bien fermé cette journée
    const checkAvailRes = await getServiceAvailabilityAction({
      serviceId: testServiceId,
      numberOfDays: 30,
    });
    assert.strictEqual(checkAvailRes.success, true);
    const blockedDay = checkAvailRes.data?.days.find((d) => d.dateKey === '2026-11-20');
    if (blockedDay) {
      assert.strictEqual(blockedDay.isOpen, false, 'Le jour bloqué doit être fermé au public');
    }
  });

  it('14. Diama (Admin) : Réouverture immédiate de la journée bloquée', async () => {
    const delRes = await deleteBlackoutPeriodAction({
      adminPin,
      blackoutId: testBlackoutId,
    });
    if (!delRes.success) {
      assert.fail(`Erreur deleteBlackoutPeriodAction: ${delRes.error}`);
    }
    assert.strictEqual(delRes.success, true);

    // Vérifier la suppression dans Supabase
    const listAfterRes = await listBlackoutPeriodsAction({ adminPin });
    assert.strictEqual(listAfterRes.success, true);
    assert.strictEqual(listAfterRes.data.some((b) => b.id === testBlackoutId), false);
  });

  it('15. Diama (Admin) : Bascule du Mode Studio en Pause (Examens / Congés)', async () => {
    // Activer le mode pause
    const pauseOnRes = await toggleExamModeAction({
      adminPin,
      examModeActive: true,
      examModeMessage: 'Studio fermé cette semaine pour révisions.',
    });
    if (!pauseOnRes.success) {
      assert.fail(`Erreur toggleExamModeAction (ON): ${pauseOnRes.error}`);
    }
    assert.strictEqual(pauseOnRes.success, true);
    assert.strictEqual(pauseOnRes.data.examModeActive, true);

    // Vérifier que le calendrier public est gelé
    const availPausedRes = await getServiceAvailabilityAction({
      serviceId: testServiceId,
      numberOfDays: 7,
    });
    assert.strictEqual(availPausedRes.success, true);
    assert.strictEqual(availPausedRes.data?.examModeActive, true);

    // Désactiver le mode pause pour remettre le studio en ligne
    const pauseOffRes = await toggleExamModeAction({
      adminPin,
      examModeActive: false,
    });
    if (!pauseOffRes.success) {
      assert.fail(`Erreur toggleExamModeAction (OFF): ${pauseOffRes.error}`);
    }
    assert.strictEqual(pauseOffRes.success, true);
    assert.strictEqual(pauseOffRes.data.examModeActive, false);
  });

  // =========================================================================
  // ÉTAPE 6 : NETTOYAGE ATOMIQUE DES DONNÉES DE SIMULATION
  // =========================================================================
  it('16. Nettoyage : Purge atomique des données de test dans Supabase', async () => {
    if (testReviewId) {
      await prisma.review.deleteMany({
        where: { id: testReviewId },
      });
    }
    if (testBookingId) {
      await prisma.booking.deleteMany({
        where: { id: testBookingId },
      });
    }

    if (testBookingId) {
      const remaining = await prisma.booking.findUnique({
        where: { id: testBookingId },
      });
      assert.strictEqual(remaining, null, 'Les données de simulation doivent être entièrement purgées');
    }
  });
});
