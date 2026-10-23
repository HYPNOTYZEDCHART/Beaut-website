'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Sparkles,
  Clock,
  ShieldCheck,
  MapPin,
  CheckCircle2,
  Info,
  ArrowRight,
  Star,
  Wallet,
} from 'lucide-react';
import {
  WhatsAppIcon,
  InstagramIcon,
  TikTokIcon,
  SnapchatIcon,
} from '@/components/ui/SocialIcons';
import {
  PublicStudioSettingsDTO,
  ServiceCatalogItemDTO,
} from '@/actions/availability.actions';
import { PublicReviewDTO } from '@/actions/review.actions';
import {
  buildGeneralContactWhatsAppUrl,
  formatDakarDateLong,
  formatXof,
} from '@/lib/whatsapp';
import { cn } from '@/lib/cn';
import { PowderyBadge } from '@/components/ui/PowderyBadge';
import { TactileButton } from '@/components/ui/TactileButton';
import { ShimmerBookingButton } from '@/components/ui/ShimmerBookingButton';
import { ServiceConditionsDrawer } from '@/components/ui/ServiceConditionsDrawer';
import { LashIllustrationCard } from '@/components/vitrine/LashIllustrationCard';
import { WaveAndOmBadge } from '@/components/ui/PaymentLogos';

interface LongScrollTrainExperienceProps {
  settings: PublicStudioSettingsDTO;
  services: ServiceCatalogItemDTO[];
  reviews: PublicReviewDTO[];
  averageRating: number;
  totalReviews: number;
}

const HIGH_INTENSITY_SPRING = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 28,
};

const STAGGER_CONTAINER_VARIANTS = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04,
    },
  },
};

const STAGGER_ITEM_VARIANTS = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.94,
    filter: 'blur(8px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: HIGH_INTENSITY_SPRING,
  },
};

export function LongScrollTrainExperience({
  settings,
  services,
  reviews,
  averageRating,
  totalReviews,
}: LongScrollTrainExperienceProps) {
  const router = useRouter();
  const [categoryFilter, setCategoryFilter] = useState<
    'ALL' | 'FULL_SET' | 'REFILL'
  >('ALL');
  const [highlightedService, setHighlightedService] =
    useState<ServiceCatalogItemDTO | null>(services[0] ?? null);
  const [drawerService, setDrawerService] =
    useState<ServiceCatalogItemDTO | null>(null);

  useEffect(() => {
    router.prefetch('/reserver');
  }, [router]);

  const filteredServices = useMemo(() => {
    if (categoryFilter === 'ALL') return services;
    return services.filter((s) => s.category === categoryFilter);
  }, [services, categoryFilter]);

  const whatsappContactUrl = buildGeneralContactWhatsAppUrl(
    settings.whatsappPhone
  );
  const cleanInsta = settings.instagramHandle.replace(/^@/, '');
  const instagramUrl = `https://instagram.com/${cleanInsta}`;
  const tiktokUrl = 'https://www.tiktok.com/@diamassa4';
  const snapchatUrl = 'https://snapchat.com/t/xA2BNkFr';

  return (
    <div className="relative">
      {/* Bannière Mode Examens si activé */}
      {settings.examModeActive && (
        <div className="border-b border-[#F6DFC0] bg-[#FDF4E7] px-4 py-3 text-center text-xs font-medium text-[#B4690E] sm:text-sm">
          {settings.examModeMessage ??
            'Mode Examens activé : les réservations sont temporairement en pause.'}
        </div>
      )}

      {/* Bannière Promotion Active */}
      {settings.promoModeActive && !settings.examModeActive && (
        <div className="border-b border-[#F3C5CE] bg-[#FDF2F4] px-4 py-3 text-center text-xs font-medium text-[#9E3E53] sm:text-sm">
          <span className="mr-2 inline-flex items-center rounded-full bg-[#E57B8F] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            Offre Spéciale
          </span>
          <span>
            {settings.promoBannerMessage ??
              'Offre exclusive : Toutes nos poses complètes sont en promotion à 15 000 FCFA pour une durée limitée !'}
          </span>
        </div>
      )}

      {/* =====================================================================
          SECTION 01 — ACCUEIL & HERO (#accueil)
         ===================================================================== */}
      <section
        id="accueil"
        className="relative scroll-mt-24 overflow-hidden bg-white py-6 sm:py-16 lg:py-20"
      >
        {/* Photo d'arrière-plan Studio (visibilité renforcée & contraste WCAG optimal) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <img
            src="/images/hero-studio-bg.jpg"
            alt=""
            loading="eager"
            className="h-full w-full object-cover object-center lg:object-[65%_center] opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/65 to-white/30 lg:from-white/88 lg:via-white/55 lg:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/60 to-transparent" />
        </div>

        <motion.div
          variants={STAGGER_CONTAINER_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6"
        >
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7 space-y-3.5 sm:space-y-5">
              <motion.div
                variants={STAGGER_ITEM_VARIANTS}
                className="flex flex-wrap items-center gap-2"
              >
                <PowderyBadge variant="rose" className="hidden sm:inline-flex">
                  Studio Privé • Dakar Diamalaye
                </PowderyBadge>
                <PowderyBadge
                  variant={settings.examModeActive ? 'amber' : 'sage'}
                >
                  <span className="h-2 w-2 rounded-full bg-current" />
                  {settings.examModeActive
                    ? 'Période d’examens en cours'
                    : 'Créneaux ouverts en direct'}
                </PowderyBadge>
              </motion.div>

              <motion.h1
                variants={STAGGER_ITEM_VARIANTS}
                className="font-serif text-3xl font-semibold leading-[1.15] tracking-tight text-[#1C191A] sm:text-5xl lg:text-6xl"
              >
                <span className="sm:hidden">L’art du regard sur-mesure à Dakar</span>
                <span className="hidden sm:inline">{settings.studioName}</span>
              </motion.h1>

              <motion.p
                variants={STAGGER_ITEM_VARIANTS}
                className="max-w-xl text-sm leading-relaxed text-[#786B6E] sm:text-base lg:text-lg"
              >
                <span>{settings.tagline}</span>
                <span className="hidden sm:inline">
                  {' '}Défilez à travers nos poses, nos consignes de
                  séance et les avis vérifiés, puis réservez votre créneau en toute
                  sérénité selon mes disponibilités réelles, sans attente.
                </span>
              </motion.p>

              <motion.div
                variants={STAGGER_ITEM_VARIANTS}
                className="flex flex-col gap-2.5 pt-1 sm:flex-row sm:items-center sm:gap-3 sm:pt-2"
              >
                <ShimmerBookingButton
                  href={
                    highlightedService
                      ? `/reserver?service=${encodeURIComponent(highlightedService.slug)}`
                      : '/reserver'
                  }
                  label="Réserver mon créneau"
                  sublabel={
                    highlightedService
                      ? `Pose : ${highlightedService.name} • ${formatXof(highlightedService.priceXof)}`
                      : 'Calendrier en temps réel • Wave & OM'
                  }
                  hideSublabelOnMobile
                />

                <a
                  href="#prestations"
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-full border border-[#F3E1E6] bg-white/90 px-4 py-2 text-xs font-medium text-[#1C191A] shadow-powdery transition-transform duration-150 ease-emil-out active:scale-[0.97] sm:min-h-12 sm:px-6 sm:py-3 sm:text-sm"
                >
                  <span>Explorer les 5 poses</span>
                  <ArrowRight
                    className="h-3.5 w-3.5 text-[#D88B99] sm:h-4 sm:w-4"
                    strokeWidth={1.5}
                  />
                </a>
              </motion.div>

              <motion.div
                variants={STAGGER_ITEM_VARIANTS}
                className="pt-1 sm:pt-2"
              >
                {/* Réassurance Mobile : fine ligne horizontale ultra-aérée avec séparateurs poudrés */}
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[#786B6E] sm:hidden">
                  <span className="inline-flex items-center gap-1">
                    <Clock
                      className="h-3 w-3 shrink-0 text-[#D88B99]"
                      strokeWidth={1.5}
                    />
                    <span>24–48h à l’avance</span>
                  </span>
                  <span className="text-[#D88B99]">•</span>
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck
                      className="h-3 w-3 shrink-0 text-[#D88B99]"
                      strokeWidth={1.5}
                    />
                    <span>Créneau garanti</span>
                  </span>
                  <span className="text-[#D88B99]">•</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin
                      className="h-3 w-3 shrink-0 text-[#D88B99]"
                      strokeWidth={1.5}
                    />
                    <span>Diamalaye</span>
                  </span>
                </div>

                {/* Réassurance Desktop : 3 cartes bien espacées */}
                <div className="hidden sm:grid sm:grid-cols-3 gap-2.5">
                  <div className="flex items-center gap-2 rounded-xl border border-[#F3E1E6] bg-[#FDF8F9] px-3.5 py-2 text-xs text-[#786B6E] tabular-nums">
                    <Clock
                      className="h-3.5 w-3.5 shrink-0 text-[#D88B99]"
                      strokeWidth={1.5}
                    />
                    <span>Réservation {settings.minNoticeHours}–48h à l'avance</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-[#F3E1E6] bg-[#FDF8F9] px-3.5 py-2 text-xs text-[#786B6E]">
                    <ShieldCheck
                      className="h-3.5 w-3.5 shrink-0 text-[#D88B99]"
                      strokeWidth={1.5}
                    />
                    <span>Zéro doublon de créneau</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-[#F3E1E6] bg-[#FDF8F9] px-3.5 py-2 text-xs text-[#786B6E]">
                    <MapPin
                      className="h-3.5 w-3.5 shrink-0 text-[#D88B99]"
                      strokeWidth={1.5}
                    />
                    <span>Dakar • Diamalaye (Rue GM-01)</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div
              variants={STAGGER_ITEM_VARIANTS}
              className="hidden sm:mt-6 sm:block lg:mt-0 lg:col-span-5"
            >
              {/* Carte masquée sur téléphone ; format hero complet dès sm */}
              <LashIllustrationCard variant="hero" />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* =====================================================================
          WAGON 02 — PRESTATIONS & TARIFS EN FCFA (#prestations)
         ===================================================================== */}
      <section
        id="prestations"
        className="scroll-mt-24 border-y border-[#F3E1E6] bg-[#FDF8F9] py-14 sm:py-20"
      >
        <motion.div
          variants={STAGGER_CONTAINER_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mx-auto max-w-5xl px-4 sm:px-6"
        >
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <motion.div variants={STAGGER_ITEM_VARIANTS}>
              <PowderyBadge variant="rose">
                Nos Poses • Tarifs en FCFA
              </PowderyBadge>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-[#1C191A] sm:text-4xl">
                Nos modèles d’extensions de cils
              </h2>
              <p className="mt-1 max-w-xl text-sm text-[#786B6E]">
                Sélectionnez une pose pour voir ses détails, puis réservez votre créneau en toute simplicité.
              </p>
            </motion.div>

            {/* Filtres de catégories avec pilule glissante layoutId */}
            <motion.div
              variants={STAGGER_ITEM_VARIANTS}
              className="inline-flex self-start rounded-full border border-[#F3E1E6] bg-white p-1 shadow-powdery"
            >
              {(
                [
                  { key: 'ALL', label: 'Toutes (5)' },
                  { key: 'FULL_SET', label: 'Poses complètes' },
                  { key: 'REFILL', label: 'Remplissage' },
                ] as const
              ).map((tab) => {
                const isActive = categoryFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setCategoryFilter(tab.key)}
                    className={cn(
                      'relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 tabular-nums',
                      isActive
                        ? 'text-[#1C191A] font-semibold'
                        : 'text-[#786B6E]'
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="category-filter-pill"
                        transition={HIGH_INTENSITY_SPRING}
                        className="pointer-events-none absolute inset-0 rounded-full border border-[#D88B99] bg-[#F9EBEF]"
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </motion.div>
          </div>


          {/* Grille des prestations avec anneau layoutId & animation alternée gauche / droite */}
          <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 overflow-x-clip">
            <AnimatePresence mode="popLayout">
              {filteredServices.map((service, index) => {
                const isSelected = highlightedService?.id === service.id;
                const enterFromLeft = index % 2 === 0;
                return (
                  <motion.article
                    key={service.id}
                    layout
                    initial={{
                      opacity: 0,
                      x: enterFromLeft ? -38 : 38,
                      y: 16,
                      scale: 0.96,
                      filter: 'blur(4px)',
                    }}
                    whileInView={{
                      opacity: 1,
                      x: 0,
                      y: 0,
                      scale: 1,
                      filter: 'blur(0px)',
                    }}
                    viewport={{ once: true, amount: 0.12 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      y: 0,
                      scale: 1,
                      filter: 'blur(0px)',
                    }}
                    exit={{
                      opacity: 0,
                      scale: 0.94,
                      filter: 'blur(6px)',
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 320,
                      damping: 26,
                      mass: 0.8,
                    }}
                    onClick={() => setHighlightedService(service)}
                    className={cn(
                      'relative flex cursor-pointer flex-col justify-between rounded-[26px] border bg-white p-6 shadow-powdery transition-transform duration-150 ease-emil-out active:scale-[0.985]',
                      isSelected ? 'border-[#D88B99]' : 'border-[#F3E1E6]'
                    )}
                  >
                  {isSelected && (
                    <motion.div
                      layoutId="train-selected-service-ring"
                      transition={HIGH_INTENSITY_SPRING}
                      className="pointer-events-none absolute inset-0 rounded-[26px] border-2 border-[#D88B99] bg-[#FDF8F9]/40"
                    />
                  )}

                  <div className="relative z-10">
                    {/* Visuel photo macro de la pose d'extensions de cils */}
                    <div className="group relative mb-4 h-48 w-full overflow-hidden rounded-[20px] border border-[#F3E1E6] bg-[#FDF8F9]">
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        loading="lazy"
                        className="h-full w-full object-cover object-center transition-transform duration-500 ease-emil-out hover:scale-[1.03]"
                      />
                      <div className="absolute inset-x-3 top-3 flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="rounded-full border border-[#F3E1E6] bg-white/95 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#B36270] backdrop-blur-sm">
                            {service.category === 'REFILL'
                              ? 'Entretien & Suivi'
                              : 'Pose Complète'}
                          </span>
                          {service.isPromoActive && (
                            <span className="rounded-full border border-[#E57B8F]/30 bg-[#E57B8F] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm backdrop-blur-sm">
                              Promo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 flex items-baseline justify-between gap-4">
                      <h3 className="font-serif text-2xl font-semibold text-[#1C191A]">
                        {service.name}
                      </h3>
                      <div className="text-right tabular-nums">
                        {service.isPromoActive &&
                        service.regularPriceXof &&
                        service.regularPriceXof > service.priceXof ? (
                          <div>
                            <span className="line-through text-xs font-normal text-[#A89A9D] mr-1.5">
                              {formatXof(service.regularPriceXof)}
                            </span>
                            <span className="text-lg font-bold text-[#C47482]">
                              {formatXof(service.priceXof)}
                            </span>
                          </div>
                        ) : (
                          <p className="text-lg font-bold text-[#1C191A]">
                            {formatXof(service.priceXof)}
                          </p>
                        )}
                        <p className="text-[11px] text-[#786B6E]">
                          Acompte : {formatXof(service.depositXof)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-[#786B6E]">
                      {service.shortDescription}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {service.naturalLashesOnly ? (
                        <PowderyBadge variant="rose">
                          <Sparkles
                            className="h-3.5 w-3.5 text-[#D88B99]"
                            strokeWidth={1.5}
                          />
                          Sur cils naturels uniquement
                        </PowderyBadge>
                      ) : (
                        <PowderyBadge variant="rose">
                          Pose du studio uniquement
                        </PowderyBadge>
                      )}

                      {service.refillAccepted && (
                        <PowderyBadge variant="sage">
                          <CheckCircle2
                            className="h-3.5 w-3.5"
                            strokeWidth={1.5}
                          />
                          Remplissage accepté (≤ 21 j)
                        </PowderyBadge>
                      )}
                    </div>
                  </div>

                  <div className="relative z-10 mt-6 flex flex-col gap-2.5 sm:flex-row">
                    <TactileButton
                      variant="secondary"
                      className="sm:flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDrawerService(service);
                      }}
                    >
                      <Info
                        className="h-4 w-4 text-[#D88B99]"
                        strokeWidth={1.5}
                      />
                      <span>Détails de la pose</span>
                    </TactileButton>

                    <TactileButton
                      variant="primary"
                      className="sm:flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(
                          `/reserver?service=${encodeURIComponent(service.slug)}`
                        );
                      }}
                    >
                      <span>Choisir ce créneau</span>
                      <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                    </TactileButton>
                  </div>
                </motion.article>
              );
            })}
            </AnimatePresence>
          </div>
        </motion.div>
      </section>

      {/* =====================================================================
          WAGON 03 — À SAVOIR AVANT DE VENIR (#a-savoir)
         ===================================================================== */}
      <section id="a-savoir" className="scroll-mt-24 bg-white py-14 sm:py-20">
        <motion.div
          variants={STAGGER_CONTAINER_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mx-auto max-w-5xl px-4 sm:px-6"
        >
          <motion.div variants={STAGGER_ITEM_VARIANTS} className="max-w-2xl">
            <PowderyBadge variant="rose">
              Consignes • À savoir avant de venir
            </PowderyBadge>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#1C191A] sm:text-4xl">
              Les règles d’or de votre rendez-vous
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-[#786B6E]">
              Une organisation douce, claire et ponctuelle pour respecter votre
              regard ainsi que mon planning d’études.
            </p>
          </motion.div>

          <motion.div
            variants={STAGGER_ITEM_VARIANTS}
            className="mt-8 grid grid-cols-1 items-center gap-6 overflow-hidden rounded-[26px] border border-[#F3E1E6] bg-[#FDF8F9] p-5 shadow-powdery md:grid-cols-12 sm:p-6"
          >
            <div className="relative h-56 overflow-hidden rounded-2xl border border-[#F3E1E6] bg-white md:col-span-5 sm:h-64">
              <img
                src="/images/studio-seance-pose.jpg"
                alt="Séance de pose d’extensions de cils au studio privé DIAMA EYELASH EXTENSIONS à Dakar"
                loading="lazy"
                className="h-full w-full object-cover object-[center_38%]"
              />
            </div>
            <div className="space-y-3 md:col-span-7">
              <PowderyBadge variant="sage">
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                Cadre privé, calme & hygiène irréprochable
              </PowderyBadge>
              <h3 className="font-serif text-2xl font-semibold text-[#1C191A] sm:text-3xl">
                Un cocon dédié à la beauté de votre regard à Dakar
              </h3>
              <p className="text-sm leading-relaxed text-[#786B6E]">
                Chaque séance inclut un temps de désinfection complète du
                matériel et du lit de pose entre deux clientes. Pour préserver
                cette sérénité et la ponctualité de mes études, merci de prendre
                connaissance des 4 règles ci-dessous avant de réserver.
              </p>
            </div>
          </motion.div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <motion.article
              variants={STAGGER_ITEM_VARIANTS}
              className="rounded-[24px] border border-[#F3E1E6] bg-[#FDF8F9] p-6 shadow-powdery"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#F3E1E6] bg-white text-[#D88B99]">
                  <MapPin className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <h3 className="font-serif text-2xl font-semibold text-[#1C191A]">
                  1. Zone & Adresse confidentielle
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#786B6E]">
                Situé à <strong className="text-[#1C191A]">Dakar (Diamalaye, repère Croisement Grand Médine)</strong>.
                Pour votre tranquillité et la sécurité du studio,{' '}
                <strong className="text-[#1C191A]">
                  l’adresse exacte est masquée sur le site et envoyée uniquement
                  après validation de votre acompte
                </strong>
                .
              </p>
            </motion.article>

            <motion.article
              variants={STAGGER_ITEM_VARIANTS}
              className="rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#F3E1E6] bg-[#FDF8F9] text-[#D88B99]">
                  <Sparkles className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <h3 className="font-serif text-2xl font-semibold text-[#1C191A]">
                  2. Préparation des cils
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#786B6E]">
                Venez les <strong className="text-[#1C191A]">yeux 100 % démaquillés</strong>,
                sans mascara ni corps gras depuis 24h, et venez seule. Les poses
                complètes se font sur cils naturels uniquement (aucun remplissage
                sur pose extérieure).
              </p>
            </motion.article>

            <motion.article
              variants={STAGGER_ITEM_VARIANTS}
              className="rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#F3E1E6] bg-[#FDF8F9] text-[#D88B99]">
                  <Clock className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <h3 className="font-serif text-2xl font-semibold text-[#1C191A]">
                  3. Règles de retard & Annulation
                </h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#786B6E] tabular-nums">
                Réservation au moins <strong className="text-[#1C191A]">24 à 48h à l’avance</strong>.
                Au-delà de <strong className="text-[#1C191A]">15 minutes de retard</strong>,
                la séance est annulée pour ne pas impacter la cliente suivante ni
                mes cours. Tout report se demande au moins 24h avant.
              </p>
            </motion.article>

            <motion.article
              variants={STAGGER_ITEM_VARIANTS}
              className="rounded-[24px] border border-[#F3E1E6] bg-[#FDF8F9] p-6 shadow-powdery"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#F3E1E6] bg-white text-[#D88B99]">
                  <Wallet className="h-5 w-5" strokeWidth={1.5} />
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="font-serif text-2xl font-semibold text-[#1C191A]">
                    4. Politique d’acompte
                  </h3>
                  <WaveAndOmBadge size="md" />
                </div>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[#786B6E] tabular-nums">
                <strong className="text-[#1C191A]">Acompte obligatoire</strong> défini selon la pose et intégralement déduit du total le jour de la séance. Non remboursable si annulation à moins de 24h ou retard &gt; 15 min ; reportable 1 fois en prévenant 24h avant ; 100 % remboursé si l’annulation vient de la praticienne.
              </p>
            </motion.article>
          </div>

          {/* Encart Aftercare — Soins & Longévité des Cils */}
          <motion.div
            variants={STAGGER_ITEM_VARIANTS}
            className="mt-6 overflow-hidden rounded-[26px] border border-[#F3E1E6] bg-[#FDF8F9] p-6 shadow-powdery sm:p-8"
          >
            <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-12">
              <div className="md:col-span-4">
                <div className="relative mx-auto max-w-[240px] overflow-hidden rounded-2xl border border-[#F3E1E6] bg-white p-2 shadow-powdery">
                  <img
                    src="/images/aftercare-guide.jpg"
                    alt="Guide aftercare extensions de cils DIAMA EYELASH EXTENSIONS Dakar"
                    loading="lazy"
                    className="h-auto w-full rounded-xl object-contain"
                  />
                </div>
              </div>
              <div className="space-y-3 md:col-span-8">
                <PowderyBadge variant="rose">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Aftercare • Longévité 3 à 4 semaines
                </PowderyBadge>
                <h3 className="font-serif text-2xl font-semibold text-[#1C191A] sm:text-3xl">
                  Prendre soin de vos extensions au quotidien
                </h3>
                <p className="text-sm leading-relaxed text-[#786B6E]">
                  Pour garder un regard impeccable sans perte prématurée : pas d'eau ni de chaleur pendant 48h, zéro corps gras sur les yeux, brossage doux au goupillon propre et sommeil sur le dos.
                </p>
                <div className="pt-2">
                  <a
                    href="/a-savoir#aftercare"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D88B99] bg-white px-5 py-2.5 text-xs font-semibold text-[#B36270] shadow-powdery transition-transform duration-150 ease-emil-out active:scale-[0.97] hover:bg-[#FDF8F9]"
                  >
                    <span>Consulter le guide complet aftercare</span>
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* =====================================================================
          WAGON 04 — AVIS CLIENTES VÉRIFIÉS (#avis)
         ===================================================================== */}
      <section
        id="avis"
        className="scroll-mt-24 border-y border-[#F3E1E6] bg-[#FDF8F9] py-14 sm:py-20"
      >
        <motion.div
          variants={STAGGER_CONTAINER_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mx-auto max-w-5xl px-4 sm:px-6"
        >
          <motion.div
            variants={STAGGER_ITEM_VARIANTS}
            className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"
          >
            <div>
              <PowderyBadge variant="sage">
                <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
                Témoignages • Avis 100 % authentiques
              </PowderyBadge>
              <h2 className="mt-2 font-serif text-3xl font-semibold text-[#1C191A] sm:text-4xl">
                Ce qu’elles pensent de leur pose
              </h2>
              <p className="mt-1 text-sm text-[#786B6E]">
                Chaque avis provient d’un lien personnel unique envoyé sur
                WhatsApp uniquement après une prestation terminée.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-2xl border border-[#F3E1E6] bg-white px-4 py-2.5 shadow-powdery tabular-nums">
              <Star className="h-5 w-5 fill-[#D88B99] text-[#D88B99]" />
              <span className="font-serif text-2xl font-bold text-[#1C191A]">
                {averageRating.toFixed(1)} / 5
              </span>
              <span className="text-xs text-[#786B6E]">
                ({totalReviews} avis)
              </span>
            </div>
          </motion.div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {reviews.map((review) => (
              <motion.article
                key={review.id}
                variants={STAGGER_ITEM_VARIANTS}
                className="flex flex-col justify-between rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={
                            idx < review.rating
                              ? 'h-4 w-4 fill-[#D88B99] text-[#D88B99]'
                              : 'h-4 w-4 text-[#F3E1E6]'
                          }
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>
                    <span className="rounded-full bg-[#F9EBEF] px-2.5 py-0.5 text-[11px] font-medium text-[#B36270]">
                      {review.serviceNameSnap}
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-[#1C191A]">
                    « {review.comment} »
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#F3E1E6] pt-3 text-xs text-[#786B6E]">
                  <span className="font-semibold text-[#1C191A]">
                    {review.publicDisplayName}
                  </span>
                  <span>
                    {formatDakarDateLong(review.submittedAtIso.slice(0, 10))}
                  </span>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </section>

      {/* =====================================================================
          WAGON 05 — CONTACT RAPIDE & DERNIER APPEL À L'ACTION (#contact)
         ===================================================================== */}
      <section id="contact" className="scroll-mt-24 bg-white py-14 sm:py-20">
        <motion.div
          variants={STAGGER_CONTAINER_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="mx-auto max-w-4xl px-4 sm:px-6"
        >
          <motion.div variants={STAGGER_ITEM_VARIANTS} className="text-center">
            <PowderyBadge variant="rose">
              Assistance • Contact & Échange direct
            </PowderyBadge>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#1C191A] sm:text-4xl">
              Une question avant votre réservation ?
            </h2>
            <p className="mx-auto mt-1 max-w-lg text-sm text-[#786B6E]">
              Écrivez-moi directement sur WhatsApp ou Instagram pour toute
              question hors réservation, ou bloquez votre créneau en ligne.
            </p>
          </motion.div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <motion.a
              variants={STAGGER_ITEM_VARIANTS}
              href={whatsappContactUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover-lift flex items-center justify-between rounded-[24px] border border-[#25D366]/30 bg-[#F4FBF7] p-5 shadow-powdery transition-all duration-150 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3.5">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-sm">
                  <WhatsAppIcon className="h-6 w-6 fill-current" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#1C191A]">
                    WhatsApp Direct
                  </h3>
                  <p className="text-xs font-semibold text-[#1A9E4B] tabular-nums">
                    {settings.whatsappPhone}
                  </p>
                </div>
              </div>
              <ArrowRight
                className="h-4 w-4 text-[#1A9E4B]"
                strokeWidth={1.5}
              />
            </motion.a>

            <motion.a
              variants={STAGGER_ITEM_VARIANTS}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover-lift flex items-center justify-between rounded-[24px] border border-[#F3E1E6] bg-[#FDF8F9] p-5 shadow-powdery transition-all duration-150 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3.5">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-sm">
                  <InstagramIcon className="h-6 w-6 fill-current" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#1C191A]">
                    Instagram
                  </h3>
                  <p className="text-xs text-[#786B6E]">
                    {settings.instagramHandle}
                  </p>
                </div>
              </div>
              <ArrowRight
                className="h-4 w-4 text-[#B36270]"
                strokeWidth={1.5}
              />
            </motion.a>

            <motion.a
              variants={STAGGER_ITEM_VARIANTS}
              href={tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover-lift flex items-center justify-between rounded-[24px] border border-[#E5E0E2] bg-white p-5 shadow-powdery transition-all duration-150 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3.5">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#010101] text-white shadow-sm">
                  <TikTokIcon className="h-6 w-6 fill-current" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#1C191A]">
                    TikTok
                  </h3>
                  <p className="text-xs text-[#786B6E]">
                    @diamassa4
                  </p>
                </div>
              </div>
              <ArrowRight
                className="h-4 w-4 text-[#1C191A]"
                strokeWidth={1.5}
              />
            </motion.a>

            <motion.a
              variants={STAGGER_ITEM_VARIANTS}
              href={snapchatUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover-lift flex items-center justify-between rounded-[24px] border border-[#FDF0A6] bg-[#FFFEF4] p-5 shadow-powdery transition-all duration-150 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3.5">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFC00] text-black shadow-sm">
                  <SnapchatIcon className="h-6 w-6 fill-current" />
                </span>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-[#1C191A]">
                    Snapchat
                  </h3>
                  <p className="text-xs font-semibold text-[#A38600]">
                    Rejoindre le Snap
                  </p>
                </div>
              </div>
              <ArrowRight
                className="h-4 w-4 text-[#A38600]"
                strokeWidth={1.5}
              />
            </motion.a>
          </div>

          <motion.div
            variants={STAGGER_ITEM_VARIANTS}
            className="mt-8 flex justify-center"
          >
            <ShimmerBookingButton
              href={
                highlightedService
                  ? `/reserver?service=${encodeURIComponent(highlightedService.slug)}`
                  : '/reserver'
              }
              label="Réserver mon rendez-vous maintenant"
              sublabel="Accès direct au calendrier des créneaux ouverts"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* Drawer immersif Vaul avec échelle 3D d'arrière-plan */}
      <ServiceConditionsDrawer
        service={drawerService}
        open={drawerService !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setDrawerService(null);
        }}
        onSelectService={(srv) =>
          router.push(`/reserver?service=${encodeURIComponent(srv.slug)}`)
        }
      />
    </div>
  );
}

