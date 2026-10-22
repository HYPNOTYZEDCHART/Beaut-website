import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeSenegalPhone,
  toWaMePhoneDigits,
  formatXof,
  formatDakarDateLong,
  buildWhatsAppUrl,
  buildDepositProofWhatsAppUrl,
  buildBookingConfirmedWhatsAppUrl,
  buildReviewRequestWhatsAppUrl,
} from '../src/lib/whatsapp';

describe('WHATSAPP & FORMATAGE DAKAR — Validation Métier Téléphonie & Monétaire', () => {
  it('1. normalizeSenegalPhone valide et normalise les préfixes sénégalais (77, 78, 76, 70, 75)', () => {
    // Avec indicatif +221
    assert.strictEqual(normalizeSenegalPhone('+221 77 123 45 67'), '+221771234567');
    assert.strictEqual(normalizeSenegalPhone('00221781234567'), '+221781234567');
    assert.strictEqual(normalizeSenegalPhone('221 76 999 88 77'), '+221769998877');

    // Sans indicatif (format local direct)
    assert.strictEqual(normalizeSenegalPhone('77 123 45 67'), '+221771234567');
    assert.strictEqual(normalizeSenegalPhone('70-456-78-90'), '+221704567890');
    assert.strictEqual(normalizeSenegalPhone('75 111 22 33'), '+221751112233');

    // Numéros internationaux acceptés
    assert.strictEqual(normalizeSenegalPhone('+33 6 12 34 56 78'), '+33612345678');

    // Numéros invalides -> Doit jeter une erreur
    assert.throws(() => normalizeSenegalPhone('12345'), /Numéro de téléphone invalide/);
    assert.throws(() => normalizeSenegalPhone('abcd'), /Numéro de téléphone invalide/);
  });

  it('2. toWaMePhoneDigits extrait uniquement les chiffres pour le protocole wa.me', () => {
    assert.strictEqual(toWaMePhoneDigits('+221 77 123 45 67'), '221771234567');
    assert.strictEqual(toWaMePhoneDigits('+33 6 12 34 56 78'), '33612345678');
  });

  it('3. formatXof formate en FCFA avec séparateurs d espaces sans décimales', () => {
    assert.strictEqual(formatXof(5000), '5\u202F000 FCFA');
    assert.strictEqual(formatXof(15000), '15\u202F000 FCFA');
    assert.strictEqual(formatXof(25000), '25\u202F000 FCFA');
    assert.strictEqual(formatXof(0), '0 FCFA');
    // Vérification anti-Float
    assert.strictEqual(formatXof(15000.4), '15\u202F000 FCFA');
  });

  it('4. formatDakarDateLong produit un libellé français complet en fuseau Dakar', () => {
    const formatted = formatDakarDateLong('2026-10-24');
    assert.ok(formatted.toLowerCase().includes('samedi'));
    assert.ok(formatted.toLowerCase().includes('24'));
    assert.ok(formatted.toLowerCase().includes('octobre'));
    assert.ok(formatted.toLowerCase().includes('2026'));
  });

  it('5. buildWhatsAppUrl encode proprement les messages sans casser les sauts de ligne', () => {
    const url = buildWhatsAppUrl('+221 77 123 45 67', 'Bonjour Diama\nJe réserve !');
    assert.ok(url.startsWith('https://wa.me/221771234567?text='));
    assert.ok(url.includes('Bonjour%20Diama'));
    assert.ok(url.includes('%0AJe%20r%C3%A9serve%20!'));
  });

  it('6. buildDepositProofWhatsAppUrl génère le message de preuve avec référence et montant', () => {
    const url = buildDepositProofWhatsAppUrl({
      studioWhatsappPhone: '+221 77 123 45 67',
      referenceCode: 'TEB-8492',
      clientName: 'Aïssatou Sow',
      serviceName: 'Pose Mixte',
      dateKey: '2026-10-28',
      startTimeLabel: '14:00',
      depositAmountXof: 5000,
      totalPriceXof: 25000,
      paymentMethod: 'WAVE',
    });

    assert.ok(url.includes('TEB-8492'));
    assert.ok(url.includes('A%C3%AFssatou%20Sow') || url.includes('Aïssatou') || url.includes('Sow'));
    assert.ok(url.includes('Pose%20Mixte'));
    assert.ok(url.includes('Wave'));
  });

  it('7. buildBookingConfirmedWhatsAppUrl et buildReviewRequestWhatsAppUrl structurent les messages de confirmation et d avis', () => {
    const confirmUrl = buildBookingConfirmedWhatsAppUrl({
      clientPhone: '+221 77 987 65 43',
      clientName: 'Fatou Diop',
      referenceCode: 'TEB-1234',
      serviceName: 'Cil à Cil',
      dateKey: '2026-10-28',
      startTimeLabel: '10:00',
      depositAmountXof: 5000,
      remainingAmountXof: 10000,
      exactAddress: 'Almadies, Dakar',
    });
    assert.ok(confirmUrl.startsWith('https://wa.me/221779876543'));
    assert.ok(confirmUrl.includes('Almadies'));

    const reviewUrl = buildReviewRequestWhatsAppUrl({
      clientPhone: '+221 77 987 65 43',
      clientName: 'Fatou',
      serviceName: 'Cil à Cil',
      reviewToken: 'sample-token',
    });
    assert.ok(reviewUrl.includes('sample-token'));
  });
});
