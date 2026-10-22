export type PaymentMethodType = 'WAVE' | 'ORANGE_MONEY';

const SENEGAL_PHONE_DIGITS_REGEX = /^(?:00221|221)?(7[05678]\d{7})$/;

/**
 * Normalise un numéro de téléphone sénégalais au format E.164 (+2217XXXXXXXX).
 */
export function normalizeSenegalPhone(rawPhone: string): string {
  let digitsOnly = rawPhone.replace(/\D/g, '');
  if (digitsOnly.startsWith('00')) {
    digitsOnly = digitsOnly.slice(2);
  }
  const match = SENEGAL_PHONE_DIGITS_REGEX.exec(digitsOnly);
  if (match && match[1]) {
    return `+221${match[1]}`;
  }
  if (digitsOnly.length >= 9 && digitsOnly.length <= 15) {
    return `+${digitsOnly}`;
  }
  throw new Error(
    'Numéro de téléphone invalide. Utilise un format sénégalais valide (ex: 77 123 45 67 ou +221 77 123 45 67).'
  );
}

/**
 * Extrait uniquement les chiffres du numéro pour l'URL https://wa.me/<digits>
 */
export function toWaMePhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Formate un montant entier en FCFA (ex: 15000 -> "15 000 FCFA").
 */
export function formatXof(amountXof: number): string {
  const rounded = Math.round(amountXof);
  const formatted = rounded
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '\u202F');
  return `${formatted} FCFA`;
}

/**
 * Formate une date "YYYY-MM-DD" en français lisible (ex: "Samedi 24 octobre 2026").
 */
export function formatDakarDateLong(dateKey: string): string {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return dateKey;
  }
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Dakar',
  }).format(date);
}

/**
 * Construit un deep-link WhatsApp universel (mobile & web).
 */
export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = toWaMePhoneDigits(phone);
  const encodedMessage = encodeURIComponent(message.trim());
  return `https://wa.me/${digits}?text=${encodedMessage}`;
}

/**
 * 1. Lien Cliente -> Praticienne (Étape 5 : Envoi de la preuve d'acompte Wave / Orange Money)
 */
export function buildDepositProofWhatsAppUrl(params: {
  studioWhatsappPhone: string;
  referenceCode: string;
  clientName: string;
  serviceName: string;
  dateKey: string;
  startTimeLabel: string;
  depositAmountXof: number;
  totalPriceXof: number;
  paymentMethod: PaymentMethodType;
}): string {
  const methodLabel =
    params.paymentMethod === 'WAVE' ? 'Wave' : 'Orange Money';
  const formattedDate = formatDakarDateLong(params.dateKey);

  const message = [
    `Bonjour DIAMA EYELASH EXTENSIONS 🌸`,
    ``,
    `Je viens de réserver mon créneau et je t'envoie ma preuve d'acompte :`,
    `• Référence : *${params.referenceCode}*`,
    `• Cliente : ${params.clientName}`,
    `• Prestation : *${params.serviceName}*`,
    `• Date : *${formattedDate} à ${params.startTimeLabel}*`,
    `• Acompte réglé : *${formatXof(params.depositAmountXof)}* via ${methodLabel} (Total : ${formatXof(params.totalPriceXof)})`,
    ``,
    `Voici ma capture d'écran de transfert ci-jointe pour confirmer mon rendez-vous :`,
  ].join('\n');

  return buildWhatsAppUrl(params.studioWhatsappPhone, message);
}

/**
 * 2. Lien Praticienne -> Cliente (Depuis /admin : Confirmation de l'acompte + envoi de l'adresse exacte)
 */
export function buildBookingConfirmedWhatsAppUrl(params: {
  clientPhone: string;
  clientName: string;
  referenceCode: string;
  serviceName: string;
  dateKey: string;
  startTimeLabel: string;
  depositAmountXof: number;
  remainingAmountXof: number;
  exactAddress: string;
}): string {
  const formattedDate = formatDakarDateLong(params.dateKey);

  const message = [
    `Coucou ${params.clientName} 🌸`,
    ``,
    `Ton acompte de *${formatXof(params.depositAmountXof)}* est bien reçu ! Ton rendez-vous chez *DIAMA EYELASH EXTENSIONS* est officiellement confirmé :`,
    `• Référence : *${params.referenceCode}*`,
    `• Pose : *${params.serviceName}*`,
    `• Créneau : *${formattedDate} à ${params.startTimeLabel}*`,
    `• Reste à régler sur place : *${formatXof(params.remainingAmountXof)}*`,
    `• Adresse exacte : *${params.exactAddress}*`,
    ``,
    `Rappel avant de venir : yeux totalement démaquillés (sans mascara ni corps gras) et merci d'arriver à l'heure précise. À très vite ✨`,
  ].join('\n');

  return buildWhatsAppUrl(params.clientPhone, message);
}

/**
 * 3. Lien Praticienne -> Cliente (Depuis /admin après "Prestation terminée" : Lien d'avis unique /avis/[token])
 */
export function buildReviewRequestWhatsAppUrl(params: {
  clientPhone: string;
  clientName: string;
  serviceName: string;
  reviewToken: string;
  appBaseUrl?: string;
}): string {
  const baseUrl = (
    params.appBaseUrl ??
    process.env.NEXT_PUBLIC_APP_URL ??
    'http://localhost:3000'
  ).replace(/\/$/, '');
  const reviewUrl = `${baseUrl}/avis/${params.reviewToken}`;

  const message = [
    `Coucou ${params.clientName} 🌸`,
    ``,
    `Merci encore pour ta confiance aujourd'hui pour ta *${params.serviceName}* chez *DIAMA EYELASH EXTENSIONS* !`,
    `Si tu as 30 secondes, ton avis m'aiderait énormément. Voici ton lien personnel sécurisé :`,
    `${reviewUrl}`,
    ``,
    `À très bientôt ✨`,
  ].join('\n');

  return buildWhatsAppUrl(params.clientPhone, message);
}

/**
 * 4. Lien Contact Rapide (/contact : question hors réservation)
 */
export function buildGeneralContactWhatsAppUrl(
  studioWhatsappPhone: string
): string {
  const message = `Bonjour DIAMA EYELASH EXTENSIONS 🌸 J'ai une question concernant une prestation :`;
  return buildWhatsAppUrl(studioWhatsappPhone, message);
}
