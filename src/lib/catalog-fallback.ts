import {
  getCatalogAndSettingsAction,
  PublicStudioSettingsDTO,
  ServiceCatalogItemDTO,
} from '@/actions/availability.actions';
import {
  getPublicApprovedReviewsAction,
  PublicReviewDTO,
} from '@/actions/review.actions';
import { isDatabaseReachableFast } from '@/lib/prisma';

export const FALLBACK_STUDIO_SETTINGS: PublicStudioSettingsDTO = {
  studioName: 'DIAMA EYELASH EXTENSIONS',
  tagline:
    'Extensions de cils sur-mesure dans un cadre doux, calme et intimiste.',
  zoneLabel:
    'Dakar — Diamalaye (adresse exacte communiquée dès confirmation)',
  whatsappPhone: '+221776852146',
  wavePhone: '+221776852146',
  orangeMoneyPhone: '+221776852146',
  instagramHandle: '@diamassa_',
  timezone: 'Africa/Dakar',
  minNoticeHours: 24,
  defaultBufferMinutes: 20,
  slotHoldMinutes: 20,
  maxAdvanceDays: 30,
  examModeActive: false,
  examModeMessage: null,
  promoModeActive: false,
  promoPriceXof: 15000,
  promoBannerMessage:
    'Offre de lancement : toutes nos poses d’extensions sont actuellement en promotion !',
};

export const FALLBACK_SERVICES: ServiceCatalogItemDTO[] = [
  {
    id: 'srv-cil-a-cil',
    slug: 'pose-cil-a-cil',
    name: 'Pose Cil à Cil',
    category: 'FULL_SET',
    shortDescription:
      'Un effet mascara naturel, élégant et aérien qui sublime le regard sans l’alourdir.',
    fullDescription:
      'Application minutieuse d’une extension sur chaque cil naturel isolé. Idéal pour une première pose ou un rendu chic au quotidien.',
    priceXof: 15000,
    regularPriceXof: 15000,
    effectivePriceXof: 15000,
    isPromoActive: false,
    depositXof: 5000,
    durationMinutes: 120,
    bufferMinutes: 20,
    naturalLashesOnly: true,
    refillAccepted: true,
    refillConditions:
      'Remplissage accepté sous 21 jours maximum (pose initiale réalisée au studio uniquement).',
    prepInstructions:
      'Venir les yeux totalement démaquillés, sans mascara ni corps gras depuis 24h.',
    imageUrl: '/images/services/cil-a-cil.jpg',
    displayOrder: 1,
  },
  {
    id: 'srv-pose-mixte',
    slug: 'pose-mixte',
    name: 'Pose Mixte',
    category: 'FULL_SET',
    shortDescription:
      'L’équilibre subtil entre la définition du cil à cil et la douceur texturée du volume.',
    fullDescription:
      'Alliance harmonieuse d’extensions cil à cil et d’éventails de volume léger pour combler les zones clairsemées tout en gardant un résultat doux.',
    priceXof: 16000,
    regularPriceXof: 16000,
    effectivePriceXof: 16000,
    isPromoActive: false,
    depositXof: 5000,
    durationMinutes: 135,
    bufferMinutes: 20,
    naturalLashesOnly: true,
    refillAccepted: true,
    refillConditions:
      'Remplissage accepté sous 21 jours maximum (pose initiale réalisée au studio uniquement).',
    prepInstructions:
      'Venir les yeux totalement démaquillés, sans mascara ni huile sur le contour des yeux.',
    imageUrl: '/images/services/pose-mixte.jpg',
    displayOrder: 2,
  },
  {
    id: 'srv-volume-leger',
    slug: 'volume-leger',
    name: 'Volume Russe',
    category: 'FULL_SET',
    shortDescription:
      'Un regard fourni, soyeux et vaporeux tout en finesse, parfait de jour comme de soirée.',
    fullDescription:
      'Bouquets faits main ultra-légers (2D à 3D) offrant une ligne de cils dense et aérienne sans jamais fatiguer vos cils naturels.',
    priceXof: 17000,
    regularPriceXof: 17000,
    effectivePriceXof: 17000,
    isPromoActive: false,
    depositXof: 5000,
    durationMinutes: 150,
    bufferMinutes: 25,
    naturalLashesOnly: true,
    refillAccepted: true,
    refillConditions:
      'Remplissage accepté sous 21 jours maximum (pose initiale réalisée au studio uniquement).',
    prepInstructions:
      'Venir les yeux totalement démaquillés, sans lentilles de contact pendant la séance.',
    imageUrl: '/images/services/volume-leger.jpg',
    displayOrder: 3,
  },
  {
    id: 'srv-volume-intense',
    slug: 'volume-intense',
    name: 'Mega Volume',
    category: 'FULL_SET',
    shortDescription:
      'Un résultat profond, sophistiqué et ultra glamour pour un regard intensément habillé.',
    fullDescription:
      'Éventails denses et ultra-souples (4D à 6D) travaillés sur-mesure selon la morphologie de vos yeux pour une courbure et une intensité maximales.',
    priceXof: 18000,
    regularPriceXof: 18000,
    effectivePriceXof: 18000,
    isPromoActive: false,
    depositXof: 5000,
    durationMinutes: 165,
    bufferMinutes: 30,
    naturalLashesOnly: true,
    refillAccepted: true,
    refillConditions:
      'Remplissage accepté sous 21 jours maximum (pose initiale réalisée au studio uniquement).',
    prepInstructions:
      'Venir les yeux totalement démaquillés. Prévoir 2h45 au calme sans appel téléphonique.',
    imageUrl: '/images/services/volume-intense.jpg',
    displayOrder: 4,
  },
  {
    id: 'srv-remplissage',
    slug: 'remplissage-2-3-semaines',
    name: 'Remplissage (2 à 3 semaines)',
    category: 'REFILL',
    shortDescription:
      'Entretien complet de votre pose pour retrouver une ligne fraîche, nette et parfaitement fournie.',
    fullDescription:
      'Nettoyage doux, retrait des extensions ayant poussé et pose de nouveaux bouquets pour redonner tout son éclat à votre pose initiale.',
    priceXof: 10000,
    regularPriceXof: 10000,
    effectivePriceXof: 10000,
    isPromoActive: false,
    depositXof: 4000,
    durationMinutes: 90,
    bufferMinutes: 20,
    naturalLashesOnly: false,
    refillAccepted: true,
    refillConditions:
      'Exclusivement réservé aux poses réalisées chez DIAMA EYELASH EXTENSIONS datant de moins de 21 jours.',
    prepInstructions:
      'Brossage et nettoyage au shampoing cils avant le rendez-vous. Aucune pose extérieure n’est remplie.',
    imageUrl: '/images/services/remplissage.jpg',
    displayOrder: 5,
  },
];

export const FALLBACK_REVIEWS: PublicReviewDTO[] = [
  {
    id: 'rev-1',
    rating: 5,
    comment:
      'Accueil hyper doux, la pose mixte est ultra légère et tient parfaitement après deux semaines. Le créneau a été respecté à la minute près !',
    publicDisplayName: 'Aïssatou N.',
    serviceNameSnap: 'Pose Mixte',
    submittedAtIso: '2026-10-10T18:00:00.000Z',
  },
  {
    id: 'rev-2',
    rating: 5,
    comment:
      'J’ai réservé en 2 minutes depuis mon téléphone. Le volume léger fait un regard de biche super naturel sans piquer les yeux.',
    publicDisplayName: 'Khadija D.',
    serviceNameSnap: 'Volume Léger (Soft Russe)',
    submittedAtIso: '2026-10-14T16:30:00.000Z',
  },
  {
    id: 'rev-3',
    rating: 5,
    comment:
      'Endroit très propre, calme et intimiste. On s’endort pendant la pose et le résultat cil à cil est exactement ce que je voulais.',
    publicDisplayName: 'Marième',
    serviceNameSnap: 'Pose Cil à Cil',
    submittedAtIso: '2026-10-17T15:00:00.000Z',
  },
];

export interface VitrineData {
  settings: PublicStudioSettingsDTO;
  services: ServiceCatalogItemDTO[];
  reviews: PublicReviewDTO[];
  averageRating: number;
  totalReviews: number;
}

export interface BookingCatalogData {
  settings: PublicStudioSettingsDTO;
  services: ServiceCatalogItemDTO[];
}

let vitrineMemoryCache: {
  data: VitrineData;
  timestamp: number;
} | null = null;

let bookingMemoryCache: {
  data: BookingCatalogData;
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 60_000; // 60 secondes de cache mémoire ultra-rapide

export function invalidateVitrineCache(): void {
  vitrineMemoryCache = null;
  bookingMemoryCache = null;
}

export async function loadBookingData(forceFresh = false): Promise<BookingCatalogData> {
  const now = Date.now();
  if (!forceFresh && bookingMemoryCache && now - bookingMemoryCache.timestamp < CACHE_TTL_MS) {
    return bookingMemoryCache.data;
  }
  // Réutilise immédiatement les données vitrine si déjà en cache mémoire
  if (!forceFresh && vitrineMemoryCache && now - vitrineMemoryCache.timestamp < CACHE_TTL_MS) {
    const data: BookingCatalogData = {
      settings: vitrineMemoryCache.data.settings,
      services: vitrineMemoryCache.data.services,
    };
    bookingMemoryCache = { data, timestamp: now };
    return data;
  }

  const dbOnline = await isDatabaseReachableFast();
  if (!dbOnline) {
    const fallbackData: BookingCatalogData = {
      settings: FALLBACK_STUDIO_SETTINGS,
      services: FALLBACK_SERVICES,
    };
    bookingMemoryCache = { data: fallbackData, timestamp: now };
    return fallbackData;
  }

  // Ne charge QUE le catalogue et les réglages nécessaires à la réservation (zéro requête sur les avis)
  const catalogRes = await getCatalogAndSettingsAction();

  const settings = catalogRes.success
    ? catalogRes.data.settings
    : FALLBACK_STUDIO_SETTINGS;

  const services =
    catalogRes.success && catalogRes.data.services.length > 0
      ? catalogRes.data.services
      : FALLBACK_SERVICES;

  const result: BookingCatalogData = { settings, services };
  bookingMemoryCache = { data: result, timestamp: now };
  return result;
}

export async function loadServicesOnly(): Promise<ServiceCatalogItemDTO[]> {
  const data = await loadBookingData();
  return data.services;
}

export async function loadVitrineData(forceFresh = false): Promise<VitrineData> {
  const now = Date.now();
  if (!forceFresh && vitrineMemoryCache && now - vitrineMemoryCache.timestamp < CACHE_TTL_MS) {
    return vitrineMemoryCache.data;
  }

  const dbOnline = await isDatabaseReachableFast();
  if (!dbOnline) {
    const fallbackData: VitrineData = {
      settings: FALLBACK_STUDIO_SETTINGS,
      services: FALLBACK_SERVICES,
      reviews: FALLBACK_REVIEWS,
      averageRating: 5.0,
      totalReviews: FALLBACK_REVIEWS.length,
    };
    vitrineMemoryCache = { data: fallbackData, timestamp: now };
    bookingMemoryCache = {
      data: { settings: FALLBACK_STUDIO_SETTINGS, services: FALLBACK_SERVICES },
      timestamp: now,
    };
    return fallbackData;
  }

  const [catalogRes, reviewsRes] = await Promise.all([
    getCatalogAndSettingsAction(),
    getPublicApprovedReviewsAction({ page: 1, limit: 20 }),
  ]);

  const settings = catalogRes.success
    ? catalogRes.data.settings
    : FALLBACK_STUDIO_SETTINGS;

  const services =
    catalogRes.success && catalogRes.data.services.length > 0
      ? catalogRes.data.services
      : FALLBACK_SERVICES;

  const reviews =
    reviewsRes.success && reviewsRes.data.data.length > 0
      ? reviewsRes.data.data
      : FALLBACK_REVIEWS;

  const averageRating =
    reviewsRes.success && reviewsRes.data.stats.totalApproved > 0
      ? reviewsRes.data.stats.averageRating
      : 5.0;

  const totalReviews =
    reviewsRes.success && reviewsRes.data.stats.totalApproved > 0
      ? reviewsRes.data.stats.totalApproved
      : FALLBACK_REVIEWS.length;

  const result: VitrineData = {
    settings,
    services,
    reviews,
    averageRating,
    totalReviews,
  };

  vitrineMemoryCache = { data: result, timestamp: now };
  bookingMemoryCache = {
    data: { settings, services },
    timestamp: now,
  };
  return result;
}

export async function loadContactSettings(): Promise<PublicStudioSettingsDTO> {
  if (bookingMemoryCache && Date.now() - bookingMemoryCache.timestamp < CACHE_TTL_MS) {
    return bookingMemoryCache.data.settings;
  }
  if (vitrineMemoryCache && Date.now() - vitrineMemoryCache.timestamp < CACHE_TTL_MS) {
    return vitrineMemoryCache.data.settings;
  }
  const full = await loadBookingData();
  return full.settings;
}

