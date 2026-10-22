import {
  PrismaClient,
  ServiceCategory,
  BookingStatus,
  DepositStatus,
  PaymentMethod,
  ReviewDisplayFormat,
  ReviewModerationStatus,
} from '@prisma/client';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // 1. Paramètres globaux du studio (Dakar - UTC+0)
  await prisma.studioSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      studioName: 'DIAMA EYELASH EXTENSIONS',
      tagline:
        'Extensions de cils sur-mesure dans un cadre doux, calme et intimiste.',
      zoneLabel:
        'Dakar — Mermoz / Sacré-Cœur (adresse exacte communiquée dès confirmation)',
      exactAddress:
        'Mermoz Pyrotechnie, Villa n°24 (Porte rose poudré, 1er étage), Dakar',
      whatsappPhone: '+221776852146',
      wavePhone: '+221776852146',
      orangeMoneyPhone: '+221776852146',
      instagramHandle: '@diamaeyelashextensions',
      timezone: 'Africa/Dakar',
      minNoticeHours: 24,
      defaultBufferMinutes: 20,
      slotHoldMinutes: 20,
      maxAdvanceDays: 30,
      slotIntervalMinutes: 30,
      examModeActive: false,
      examModeMessage:
        'Les réservations sont temporairement en pause pour mes examens universitaires. Les nouveaux créneaux arrivent très vite !',
    },
  });

  // 2. Catalogue des 5 prestations & tarifs en FCFA (entiers stricts)
  const services = [
    {
      slug: 'pose-cil-a-cil',
      name: 'Pose Cil à Cil',
      category: ServiceCategory.FULL_SET,
      shortDescription:
        'Un effet mascara naturel, élégant et aérien qui sublime le regard sans l’alourdir.',
      fullDescription:
        'Application minutieuse d’une extension sur chaque cil naturel isolé. Idéal pour une première pose ou un rendu chic au quotidien.',
      priceXof: 15000,
      depositXof: 5000,
      durationMinutes: 120,
      bufferMinutes: 20,
      naturalLashesOnly: true,
      refillAccepted: true,
      refillConditions:
        'Remplissage accepté sous 21 jours maximum avec au moins 40 % des extensions restantes (pose initiale réalisée au studio uniquement).',
      prepInstructions:
        'Venir les yeux totalement démaquillés, sans mascara ni corps gras depuis 24h.',
      imageUrl: '/images/services/cil-a-cil.jpg',
      displayOrder: 1,
    },
    {
      slug: 'pose-mixte',
      name: 'Pose Mixte',
      category: ServiceCategory.FULL_SET,
      shortDescription:
        'L’équilibre subtil entre la définition du cil à cil et la douceur texturée du volume.',
      fullDescription:
        'Alliance harmonieuse d’extensions cil à cil et d’éventails de volume léger pour combler les zones clairsemées tout en gardant un résultat doux.',
      priceXof: 18000,
      depositXof: 5000,
      durationMinutes: 135,
      bufferMinutes: 20,
      naturalLashesOnly: true,
      refillAccepted: true,
      refillConditions:
        'Remplissage accepté sous 21 jours maximum avec au moins 40 % des extensions restantes (pose initiale réalisée au studio uniquement).',
      prepInstructions:
        'Venir les yeux totalement démaquillés, sans mascara ni huile sur le contour des yeux.',
      imageUrl: '/images/services/pose-mixte.jpg',
      displayOrder: 2,
    },
    {
      slug: 'volume-leger',
      name: 'Volume Léger (Soft Russe)',
      category: ServiceCategory.FULL_SET,
      shortDescription:
        'Un regard fourni, soyeux et vaporeux tout en finesse, parfait de jour comme de soirée.',
      fullDescription:
        'Bouquets faits main ultra-légers (2D à 3D) offrant une ligne de cils dense et aérienne sans jamais fatiguer vos cils naturels.',
      priceXof: 20000,
      depositXof: 5000,
      durationMinutes: 150,
      bufferMinutes: 25,
      naturalLashesOnly: true,
      refillAccepted: true,
      refillConditions:
        'Remplissage accepté sous 21 jours maximum avec au moins 40 % des extensions restantes (pose initiale réalisée au studio uniquement).',
      prepInstructions:
        'Venir les yeux totalement démaquillés, sans lentilles de contact pendant la séance.',
      imageUrl: '/images/services/volume-leger.jpg',
      displayOrder: 3,
    },
    {
      slug: 'volume-intense',
      name: 'Volume Intense',
      category: ServiceCategory.FULL_SET,
      shortDescription:
        'Un résultat profond, sophistiqué et haute couture pour un regard intensément habillé.',
      fullDescription:
        'Éventails denses et ultra-souples (4D à 6D) travaillés sur-mesure selon la morphologie de vos yeux pour une courbure et une intensité maximales.',
      priceXof: 25000,
      depositXof: 7000,
      durationMinutes: 165,
      bufferMinutes: 30,
      naturalLashesOnly: true,
      refillAccepted: true,
      refillConditions:
        'Remplissage accepté sous 21 jours maximum avec au moins 40 % des extensions restantes (pose initiale réalisée au studio uniquement).',
      prepInstructions:
        'Venir les yeux totalement démaquillés. Prévoir 2h45 au calme sans appel téléphonique.',
      imageUrl: '/images/services/volume-intense.jpg',
      displayOrder: 4,
    },
    {
      slug: 'remplissage-2-3-semaines',
      name: 'Remplissage (2 à 3 semaines)',
      category: ServiceCategory.REFILL,
      shortDescription:
        'Entretien complet de votre pose pour retrouver une ligne fraîche, nette et parfaitement fournie.',
      fullDescription:
        'Nettoyage doux, retrait des extensions ayant poussé et pose de nouveaux bouquets pour redonner tout son éclat à votre pose initiale.',
      priceXof: 12000,
      depositXof: 4000,
      durationMinutes: 90,
      bufferMinutes: 20,
      naturalLashesOnly: false,
      refillAccepted: true,
      refillConditions:
        'Exclusivement réservé aux poses réalisées chez DIAMA EYELASH EXTENSIONS datant de moins de 21 jours avec au moins 40 % des extensions restantes. Au-delà, une dépose + nouvelle pose complète sera facturée.',
      prepInstructions:
        'Brossage et nettoyage au shampoing cils avant le rendez-vous. Aucune pose extérieure n’est remplie.',
      imageUrl: '/images/services/remplissage.jpg',
      displayOrder: 5,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }

  // 3. Plages horaires hebdomadaires fixes (adaptées aux études : Mercredi PM, Vendredi PM, Samedi)
  await prisma.weeklySchedule.deleteMany({});
  await prisma.weeklySchedule.createMany({
    data: [
      {
        dayOfWeek: 3, // Mercredi
        startTime: '14:30',
        endTime: '19:30',
        label: 'Mercredi après-midi',
        isActive: true,
      },
      {
        dayOfWeek: 5, // Vendredi
        startTime: '14:30',
        endTime: '19:30',
        label: 'Vendredi après-midi',
        isActive: true,
      },
      {
        dayOfWeek: 6, // Samedi
        startTime: '09:30',
        endTime: '18:30',
        label: 'Samedi journée',
        isActive: true,
      },
    ],
  });

  // 4. Avis initial vérifié (lié à une prestation terminée) pour alimenter le carrousel d'accueil
  const cilACil = await prisma.service.findUnique({
    where: { slug: 'pose-mixte' },
  });

  if (cilACil) {
    const sampleBooking = await prisma.booking.upsert({
      where: { referenceCode: 'TEB-1001' },
      update: {},
      create: {
        referenceCode: 'TEB-1001',
        serviceId: cilACil.id,
        clientName: 'Aïssatou Ndiaye',
        clientPhone: '+221778889900',
        clientInstagram: '@aissatou.nd',
        agreedToRules: true,
        dateKey: '2026-10-10',
        startTimeLabel: '14:30',
        endTimeLabel: '16:45',
        startAt: new Date('2026-10-10T14:30:00.000Z'),
        endAt: new Date('2026-10-10T16:45:00.000Z'),
        bufferEndAt: new Date('2026-10-10T17:05:00.000Z'),
        totalPriceXof: cilACil.priceXof,
        depositAmountXof: cilACil.depositXof,
        paymentMethod: PaymentMethod.WAVE,
        depositStatus: DepositStatus.CONFIRMED,
        depositConfirmedAt: new Date('2026-10-08T12:00:00.000Z'),
        status: BookingStatus.COMPLETED,
        completedAt: new Date('2026-10-10T16:50:00.000Z'),
      },
    });

    await prisma.review.upsert({
      where: { bookingId: sampleBooking.id },
      update: {},
      create: {
        bookingId: sampleBooking.id,
        token: 'seed-verified-token-teb-1001',
        rating: 5,
        comment:
          'Accueil hyper doux, la pose mixte est ultra légère et tient parfaitement après deux semaines. Le créneau a été respecté à la minute près !',
        displayFormat: ReviewDisplayFormat.FIRST_NAME_INITIAL,
        publicDisplayName: 'Aïssatou N.',
        serviceNameSnap: cilACil.name,
        consentGiven: true,
        moderationStatus: ReviewModerationStatus.APPROVED,
        submittedAt: new Date('2026-10-10T18:00:00.000Z'),
        moderatedAt: new Date('2026-10-10T18:30:00.000Z'),
        expiresAt: new Date('2026-10-24T18:00:00.000Z'),
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Seed error:', error);
    await prisma.$disconnect();
    process.exit(1);
  });

