-- ============================================================================
-- TON ESPACE BEAUTÉ (DAKAR) — MIGRATION INITIALE PRISMA & SUPABASE POSTGRESQL
-- Tables : StudioSettings, Service, WeeklySchedule, BlackoutPeriod, Booking, Review
-- ============================================================================

-- 1. Enums PostgreSQL (Idempotents)
DO $$ BEGIN
  CREATE TYPE "ServiceCategory" AS ENUM ('FULL_SET', 'REFILL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "BookingStatus" AS ENUM ('PENDING_DEPOSIT', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'EXPIRED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'SUBMITTED_WHATSAPP', 'CONFIRMED', 'REFUNDED', 'FORFEITED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('WAVE', 'ORANGE_MONEY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "BlackoutType" AS ENUM ('EXAM_PERIOD', 'MANUAL_BLOCK', 'HOLIDAY');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReviewDisplayFormat" AS ENUM ('FIRST_NAME', 'FIRST_NAME_INITIAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE "ReviewModerationStatus" AS ENUM ('INVITED', 'PENDING_MODERATION', 'APPROVED', 'REJECTED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Table StudioSettings
CREATE TABLE IF NOT EXISTS "StudioSettings" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "studioName" TEXT NOT NULL DEFAULT 'TON ESPACE BEAUTÉ',
  "tagline" TEXT NOT NULL DEFAULT 'Extensions de cils sur-mesure dans un cadre doux, calme et intimiste.',
  "zoneLabel" TEXT NOT NULL DEFAULT 'Dakar — Mermoz / Sacré-Cœur (adresse exacte envoyée dès confirmation)',
  "exactAddress" TEXT NOT NULL DEFAULT 'Mermoz Pyrotechnie, Villa n°24 (Porte rose poudré, 1er étage), Dakar',
  "whatsappPhone" TEXT NOT NULL DEFAULT '+221770000000',
  "wavePhone" TEXT NOT NULL DEFAULT '+221770000000',
  "orangeMoneyPhone" TEXT NOT NULL DEFAULT '+221770000000',
  "instagramHandle" TEXT NOT NULL DEFAULT '@tonespacebeaute',
  "timezone" TEXT NOT NULL DEFAULT 'Africa/Dakar',
  "minNoticeHours" INTEGER NOT NULL DEFAULT 24,
  "defaultBufferMinutes" INTEGER NOT NULL DEFAULT 20,
  "slotHoldMinutes" INTEGER NOT NULL DEFAULT 20,
  "maxAdvanceDays" INTEGER NOT NULL DEFAULT 30,
  "slotIntervalMinutes" INTEGER NOT NULL DEFAULT 30,
  "examModeActive" BOOLEAN NOT NULL DEFAULT false,
  "examModeMessage" TEXT DEFAULT 'Les réservations sont temporairement suspendues pour période d''examens. De nouveaux créneaux seront ouverts très vite.',
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "StudioSettings_pkey" PRIMARY KEY ("id")
);

-- 3. Table Service
CREATE TABLE IF NOT EXISTS "Service" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" "ServiceCategory" NOT NULL DEFAULT 'FULL_SET',
  "shortDescription" TEXT NOT NULL,
  "fullDescription" TEXT,
  "priceXof" INTEGER NOT NULL,
  "depositXof" INTEGER NOT NULL,
  "durationMinutes" INTEGER NOT NULL,
  "bufferMinutes" INTEGER NOT NULL DEFAULT 20,
  "naturalLashesOnly" BOOLEAN NOT NULL DEFAULT true,
  "refillAccepted" BOOLEAN NOT NULL DEFAULT true,
  "refillConditions" TEXT,
  "prepInstructions" TEXT,
  "imageUrl" TEXT NOT NULL,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Service_slug_key" ON "Service"("slug");
CREATE INDEX IF NOT EXISTS "Service_isActive_displayOrder_idx" ON "Service"("isActive", "displayOrder");

-- 4. Table WeeklySchedule
CREATE TABLE IF NOT EXISTS "WeeklySchedule" (
  "id" TEXT NOT NULL,
  "dayOfWeek" INTEGER NOT NULL,
  "startTime" TEXT NOT NULL,
  "endTime" TEXT NOT NULL,
  "label" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "WeeklySchedule_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WeeklySchedule_dayOfWeek_isActive_idx" ON "WeeklySchedule"("dayOfWeek", "isActive");

-- 5. Table BlackoutPeriod
CREATE TABLE IF NOT EXISTS "BlackoutPeriod" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "type" "BlackoutType" NOT NULL DEFAULT 'MANUAL_BLOCK',
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "isAllDay" BOOLEAN NOT NULL DEFAULT false,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "BlackoutPeriod_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "BlackoutPeriod_startAt_endAt_idx" ON "BlackoutPeriod"("startAt", "endAt");
CREATE INDEX IF NOT EXISTS "BlackoutPeriod_type_startAt_idx" ON "BlackoutPeriod"("type", "startAt");

-- 6. Table Booking
CREATE TABLE IF NOT EXISTS "Booking" (
  "id" TEXT NOT NULL,
  "referenceCode" TEXT NOT NULL,
  "serviceId" TEXT NOT NULL,
  "clientName" TEXT NOT NULL,
  "clientPhone" TEXT NOT NULL,
  "clientInstagram" TEXT,
  "clientNotes" TEXT,
  "agreedToRules" BOOLEAN NOT NULL DEFAULT true,
  "dateKey" TEXT NOT NULL,
  "startTimeLabel" TEXT NOT NULL,
  "endTimeLabel" TEXT NOT NULL,
  "startAt" TIMESTAMP(3) NOT NULL,
  "endAt" TIMESTAMP(3) NOT NULL,
  "bufferEndAt" TIMESTAMP(3) NOT NULL,
  "totalPriceXof" INTEGER NOT NULL,
  "depositAmountXof" INTEGER NOT NULL,
  "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'WAVE',
  "depositStatus" "DepositStatus" NOT NULL DEFAULT 'PENDING',
  "depositConfirmedAt" TIMESTAMP(3),
  "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_DEPOSIT',
  "lockedUntil" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "cancelledAt" TIMESTAMP(3),
  "cancellationReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Booking_referenceCode_key" ON "Booking"("referenceCode");
CREATE INDEX IF NOT EXISTS "Booking_dateKey_status_idx" ON "Booking"("dateKey", "status");
CREATE INDEX IF NOT EXISTS "Booking_startAt_bufferEndAt_status_idx" ON "Booking"("startAt", "bufferEndAt", "status");
CREATE INDEX IF NOT EXISTS "Booking_status_lockedUntil_idx" ON "Booking"("status", "lockedUntil");
CREATE INDEX IF NOT EXISTS "Booking_clientPhone_idx" ON "Booking"("clientPhone");

DO $$ BEGIN
  ALTER TABLE "Booking"
    ADD CONSTRAINT "Booking_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id")
    ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 7. Table Review
CREATE TABLE IF NOT EXISTS "Review" (
  "id" TEXT NOT NULL,
  "bookingId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "rating" INTEGER,
  "comment" TEXT,
  "displayFormat" "ReviewDisplayFormat" NOT NULL DEFAULT 'FIRST_NAME_INITIAL',
  "publicDisplayName" TEXT,
  "serviceNameSnap" TEXT NOT NULL,
  "consentGiven" BOOLEAN NOT NULL DEFAULT false,
  "moderationStatus" "ReviewModerationStatus" NOT NULL DEFAULT 'INVITED',
  "moderationNote" TEXT,
  "submittedAt" TIMESTAMP(3),
  "moderatedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "Review_bookingId_key" ON "Review"("bookingId");
CREATE UNIQUE INDEX IF NOT EXISTS "Review_token_key" ON "Review"("token");
CREATE INDEX IF NOT EXISTS "Review_moderationStatus_submittedAt_idx" ON "Review"("moderationStatus", "submittedAt");

DO $$ BEGIN
  ALTER TABLE "Review"
    ADD CONSTRAINT "Review_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================================================
-- 8. SEED INITIAL DAKAR (PARAMÈTRES, 5 POSES EN FCFA, PLANNING ÉTUDIANT, AVIS)
-- ============================================================================

INSERT INTO "StudioSettings" (
  "id", "studioName", "tagline", "zoneLabel", "exactAddress",
  "whatsappPhone", "wavePhone", "orangeMoneyPhone", "instagramHandle",
  "timezone", "minNoticeHours", "defaultBufferMinutes", "slotHoldMinutes",
  "maxAdvanceDays", "slotIntervalMinutes", "examModeActive", "examModeMessage", "updatedAt"
) VALUES (
  'default',
  'TON ESPACE BEAUTÉ',
  'Extensions de cils sur-mesure dans un cadre doux, calme et intimiste.',
  'Dakar — Mermoz / Sacré-Cœur (adresse exacte communiquée dès confirmation)',
  'Mermoz Pyrotechnie, Villa n°24 (Porte rose poudré, 1er étage), Dakar',
  '+221771234567',
  '+221771234567',
  '+221771234567',
  '@tonespacebeaute',
  'Africa/Dakar',
  24, 20, 20, 30, 30, false,
  'Les réservations sont temporairement en pause pour mes examens universitaires. Les nouveaux créneaux arrivent très vite !',
  CURRENT_TIMESTAMP
) ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Service" (
  "id", "slug", "name", "category", "shortDescription", "fullDescription",
  "priceXof", "depositXof", "durationMinutes", "bufferMinutes",
  "naturalLashesOnly", "refillAccepted", "refillConditions", "prepInstructions",
  "imageUrl", "displayOrder", "isActive", "updatedAt"
) VALUES
(
  'srv-cil-a-cil',
  'pose-cil-a-cil',
  'Pose Cil à Cil',
  'FULL_SET',
  'Un effet mascara naturel, élégant et aérien qui sublime le regard sans l’alourdir.',
  'Application minutieuse d’une extension sur chaque cil naturel isolé. Idéal pour une première pose ou un rendu chic au quotidien.',
  15000, 5000, 120, 20, true, true,
  'Remplissage accepté sous 21 jours maximum (pose initiale réalisée au studio uniquement).',
  'Venir les yeux totalement démaquillés, sans mascara ni corps gras depuis 24h.',
  '/images/services/cil-a-cil.jpg',
  1, true, CURRENT_TIMESTAMP
),
(
  'srv-pose-mixte',
  'pose-mixte',
  'Pose Mixte',
  'FULL_SET',
  'L’équilibre subtil entre la définition du cil à cil et la douceur texturée du volume.',
  'Alliance harmonieuse d’extensions cil à cil et d’éventails de volume léger pour combler les zones clairsemées tout en gardant un résultat doux.',
  18000, 5000, 135, 20, true, true,
  'Remplissage accepté sous 21 jours maximum (pose initiale réalisée au studio uniquement).',
  'Venir les yeux totalement démaquillés, sans mascara ni huile sur le contour des yeux.',
  '/images/services/pose-mixte.jpg',
  2, true, CURRENT_TIMESTAMP
),
(
  'srv-volume-leger',
  'volume-leger',
  'Volume Léger (Soft Russe)',
  'FULL_SET',
  'Un regard fourni, soyeux et vaporeux tout en finesse, parfait de jour comme de soirée.',
  'Bouquets faits main ultra-légers (2D à 3D) offrant une ligne de cils dense et aérienne sans jamais fatiguer vos cils naturels.',
  20000, 5000, 150, 25, true, true,
  'Remplissage accepté sous 21 jours maximum (pose initiale réalisée au studio uniquement).',
  'Venir les yeux totalement démaquillés, sans lentilles de contact pendant la séance.',
  '/images/services/volume-leger.jpg',
  3, true, CURRENT_TIMESTAMP
),
(
  'srv-volume-intense',
  'volume-intense',
  'Volume Intense',
  'FULL_SET',
  'Un résultat profond, sophistiqué et ultra glamour pour un regard intensément habillé.',
  'Éventails denses et ultra-souples (4D à 6D) travaillés sur-mesure selon la morphologie de vos yeux pour une courbure et une intensité maximales.',
  25000, 7000, 165, 30, true, true,
  'Remplissage accepté sous 21 jours maximum (pose initiale réalisée au studio uniquement).',
  'Venir les yeux totalement démaquillés. Prévoir 2h45 au calme sans appel téléphonique.',
  '/images/services/volume-intense.jpg',
  4, true, CURRENT_TIMESTAMP
),
(
  'srv-remplissage',
  'remplissage-2-3-semaines',
  'Remplissage (2 à 3 semaines)',
  'REFILL',
  'Entretien complet de votre pose pour retrouver une ligne fraîche, nette et parfaitement fournie.',
  'Nettoyage doux, retrait des extensions ayant poussé et pose de nouveaux bouquets pour redonner tout son éclat à votre pose initiale.',
  12000, 4000, 90, 20, false, true,
  'Exclusivement réservé aux poses réalisées chez DIAMA EYELASH EXTENSIONS datant de moins de 21 jours.',
  'Brossage et nettoyage au shampoing cils avant le rendez-vous. Aucune pose extérieure n’est remplie.',
  '/images/services/remplissage.jpg',
  5, true, CURRENT_TIMESTAMP
) ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "WeeklySchedule" ("id", "dayOfWeek", "startTime", "endTime", "label", "isActive", "updatedAt") VALUES
('sched-wed', 3, '14:30', '19:30', 'Mercredi après-midi', true, CURRENT_TIMESTAMP),
('sched-fri', 5, '14:30', '19:30', 'Vendredi après-midi', true, CURRENT_TIMESTAMP),
('sched-sat', 6, '09:30', '18:30', 'Samedi journée', true, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Booking" (
  "id", "referenceCode", "serviceId", "clientName", "clientPhone", "clientInstagram",
  "agreedToRules", "dateKey", "startTimeLabel", "endTimeLabel",
  "startAt", "endAt", "bufferEndAt", "totalPriceXof", "depositAmountXof",
  "paymentMethod", "depositStatus", "depositConfirmedAt", "status", "completedAt", "updatedAt"
) VALUES (
  'booking-seed-1001',
  'TEB-1001',
  'srv-pose-mixte',
  'Aïssatou Ndiaye',
  '+221778889900',
  '@aissatou.nd',
  true,
  '2026-10-10',
  '14:30',
  '16:45',
  '2026-10-10T14:30:00.000Z',
  '2026-10-10T16:45:00.000Z',
  '2026-10-10T17:05:00.000Z',
  18000,
  5000,
  'WAVE',
  'CONFIRMED',
  '2026-10-08T12:00:00.000Z',
  'COMPLETED',
  '2026-10-10T16:50:00.000Z',
  CURRENT_TIMESTAMP
) ON CONFLICT ("referenceCode") DO NOTHING;

INSERT INTO "Review" (
  "id", "bookingId", "token", "rating", "comment", "displayFormat",
  "publicDisplayName", "serviceNameSnap", "consentGiven", "moderationStatus",
  "submittedAt", "moderatedAt", "expiresAt", "updatedAt"
) VALUES (
  'review-seed-1001',
  'booking-seed-1001',
  'seed-verified-token-teb-1001',
  5,
  'Accueil hyper doux, la pose mixte est ultra légère et tient parfaitement après deux semaines. Le créneau a été respecté à la minute près !',
  'FIRST_NAME_INITIAL',
  'Aïssatou N.',
  'Pose Mixte',
  true,
  'APPROVED',
  '2026-10-10T18:00:00.000Z',
  '2026-10-10T18:30:00.000Z',
  '2026-10-24T18:00:00.000Z',
  CURRENT_TIMESTAMP
) ON CONFLICT ("bookingId") DO NOTHING;

