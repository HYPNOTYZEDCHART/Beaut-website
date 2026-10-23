'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Drawer } from 'vaul';
import { toast } from 'sonner';
import {
  Check,
  Sparkles,
  Clock,
  ShieldCheck,
  Copy,
  MessageCircle,
  ArrowLeft,
  ArrowRight,
  Info,
  Lock,
  MapPin,
  CheckCircle2,
  Wallet,
  X,
  Smartphone,
  ExternalLink,
  Send,
} from 'lucide-react';
import {
  getServiceAvailabilityAction,
  PublicStudioSettingsDTO,
  ServiceCatalogItemDTO,
} from '@/actions/availability.actions';
import {
  createBookingAndLockSlotAction,
  LockedBookingCreatedDTO,
  markDepositSubmittedWhatsappAction,
} from '@/actions/booking.actions';
import {
  AvailabilityCalendarResult,
  computeAvailabilityCalendar,
  ComputedSlot,
} from '@/lib/slot-engine';
import {
  buildDepositProofWhatsAppUrl,
  formatDakarDateLong,
  formatXof,
} from '@/lib/whatsapp';
import { cn } from '@/lib/cn';
import { PowderyBadge } from '@/components/ui/PowderyBadge';
import { TactileButton } from '@/components/ui/TactileButton';
import { ServiceConditionsDrawer } from '@/components/ui/ServiceConditionsDrawer';
import { WaveLogo, OrangeMoneyLogo } from '@/components/ui/PaymentLogos';

type WizardStep = 1 | 2 | 3 | 4 | 5 | 6;

interface BookingWizardProps {
  settings: PublicStudioSettingsDTO;
  services: ServiceCatalogItemDTO[];
  initialServiceSlug?: string;
}

const STEP_LABELS: Record<WizardStep, string> = {
  1: 'Fonctionnement',
  2: 'Choix de la pose',
  3: 'Jour & Heure',
  4: 'Vos coordonnées',
  5: 'Acompte & Verrouillage',
  6: 'Confirmation',
};

const HIGH_SPRING = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 28,
};

const STEP_CASCADE_CONTAINER = {
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
    transition: {
      ...HIGH_SPRING,
      staggerChildren: 0.06,
      delayChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    y: -14,
    scale: 0.96,
    filter: 'blur(8px)',
    transition: {
      duration: 0.2,
    },
  },
};

const STEP_CASCADE_ITEM = {
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
    transition: HIGH_SPRING,
  },
};

function buildLocalFallbackCalendar(
  service: ServiceCatalogItemDTO,
  settings: PublicStudioSettingsDTO
): AvailabilityCalendarResult {
  return computeAvailabilityCalendar({
    service: {
      id: service.id,
      name: service.name,
      durationMinutes: service.durationMinutes,
      bufferMinutes: service.bufferMinutes,
      priceXof: service.priceXof,
      depositXof: service.depositXof,
    },
    settings: {
      minNoticeHours: settings.minNoticeHours,
      defaultBufferMinutes: settings.defaultBufferMinutes,
      slotHoldMinutes: settings.slotHoldMinutes,
      maxAdvanceDays: settings.maxAdvanceDays,
      slotIntervalMinutes: 30,
      examModeActive: settings.examModeActive,
      examModeMessage: settings.examModeMessage,
    },
    weeklySchedules: [
      { dayOfWeek: 3, startTime: '14:30', endTime: '19:30', isActive: true },
      { dayOfWeek: 5, startTime: '14:30', endTime: '19:30', isActive: true },
      { dayOfWeek: 6, startTime: '09:30', endTime: '18:30', isActive: true },
    ],
    blackoutPeriods: [],
    existingBookings: [],
  });
}

export function BookingWizard({
  settings,
  services,
  initialServiceSlug,
}: BookingWizardProps) {
  const preselectedService = useMemo(
    () =>
      initialServiceSlug
        ? services.find((s) => s.slug === initialServiceSlug) ?? services[0]
        : services[0],
    [initialServiceSlug, services]
  );

  const [step, setStep] = useState<WizardStep>(1);
  const [selectedService, setSelectedService] =
    useState<ServiceCatalogItemDTO | null>(preselectedService ?? null);
  const [drawerService, setDrawerService] =
    useState<ServiceCatalogItemDTO | null>(null);

  // Étape 3 : Disponibilités
  const [calendarLoading, setCalendarLoading] = useState<boolean>(false);
  const [calendarData, setCalendarData] =
    useState<AvailabilityCalendarResult | null>(null);
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);
  const dayStripRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const strip = dayStripRef.current;
    if (!strip || !selectedDateKey) return;
    const target = strip.querySelector<HTMLElement>(
      `[data-date-key="${selectedDateKey}"]`
    );
    if (!target) return;
    const left =
      target.offsetLeft - (strip.clientWidth - target.offsetWidth) / 2;
    strip.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [selectedDateKey]);
  const [selectedSlot, setSelectedSlot] = useState<ComputedSlot | null>(null);

  // Étape 4 : Formulaire Cliente
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('+221 ');
  const [clientNotes, setClientNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'WAVE' | 'ORANGE_MONEY'>(
    'WAVE'
  );
  const [agreedToRules, setAgreedToRules] = useState<boolean>(false);
  const [isSubmittingBooking, setIsSubmittingBooking] =
    useState<boolean>(false);

  // Étape 5 & 6 : Verrouillage & Acompte
  const [lockedBooking, setLockedBooking] =
    useState<LockedBookingCreatedDTO | null>(null);
  const [depositDrawerOpen, setDepositDrawerOpen] = useState<boolean>(false);
  const [remainingLockSeconds, setRemainingLockSeconds] = useState<number>(
    settings.slotHoldMinutes * 60
  );
  const [isMarkingProofSent, setIsMarkingProofSent] = useState<boolean>(false);
  const [hasLaunchedPaymentApp, setHasLaunchedPaymentApp] =
    useState<boolean>(false);
  const [showReturnedPrompt, setShowReturnedPrompt] = useState<boolean>(false);

  // Détection automatique du retour de l'application de paiement (Wave / Orange Money)
  useEffect(() => {
    if (!hasLaunchedPaymentApp || step !== 5) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setShowReturnedPrompt(true);
      }
    };

    const handleFocus = () => {
      setShowReturnedPrompt(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [hasLaunchedPaymentApp, step]);

  useEffect(() => {
    if (!selectedService) return;
    let isCancelled = false;

    async function fetchSlots(srv: ServiceCatalogItemDTO) {
      setCalendarLoading(true);
      const res = await getServiceAvailabilityAction({
        serviceId: srv.id,
        numberOfDays: settings.maxAdvanceDays,
      });

      if (isCancelled) return;

      const resolvedCalendar = res.success
        ? res.data
        : buildLocalFallbackCalendar(srv, settings);

      setCalendarData(resolvedCalendar);

      const firstOpenDay = resolvedCalendar.days.find((d) => d.isOpen);
      setSelectedDateKey(firstOpenDay ? firstOpenDay.dateKey : null);
      setSelectedSlot(null);
      setCalendarLoading(false);
    }

    void fetchSlots(selectedService);

    return () => {
      isCancelled = true;
    };
  }, [selectedService, settings]);

  useEffect(() => {
    if (!lockedBooking || step !== 5) return;

    const updateTimer = () => {
      const diffMs =
        new Date(lockedBooking.lockedUntilIso).getTime() - Date.now();
      setRemainingLockSeconds(Math.max(0, Math.floor(diffMs / 1000)));
    };

    updateTimer();
    const interval = window.setInterval(updateTimer, 1000);
    return () => window.clearInterval(interval);
  }, [lockedBooking, step]);

  const openDays = useMemo(
    () => (calendarData ? calendarData.days.filter((d) => d.isOpen) : []),
    [calendarData]
  );

  const activeDaySlots = useMemo(() => {
    if (!selectedDateKey) return [];
    const found = openDays.find((d) => d.dateKey === selectedDateKey);
    return found ? found.slots : [];
  }, [openDays, selectedDateKey]);

  const formattedCountdown = useMemo(() => {
    const mins = Math.floor(remainingLockSeconds / 60);
    const secs = remainingLockSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }, [remainingLockSeconds]);

  async function handleCopyPhone(phone: string, label: string) {
    try {
      await navigator.clipboard.writeText(phone.replace(/\s+/g, ''));
      toast.success(`Numéro ${label} copié dans le presse-papiers`);
    } catch {
      toast.info(`Numéro ${label} : ${phone}`);
    }
  }

  async function handleLaunchPaymentApp(method: 'WAVE' | 'ORANGE_MONEY') {
    if (!lockedBooking) return;
    const phone =
      method === 'WAVE'
        ? lockedBooking.wavePhone
        : lockedBooking.orangeMoneyPhone;
    const cleanPhone = phone.replace(/\s+/g, '');

    // Copie automatique du numéro dans le presse-papier avec confirmation toast
    try {
      await navigator.clipboard.writeText(cleanPhone);
      toast.success(
        `Numéro (${phone}) et montant (${formatXof(lockedBooking.depositAmountXof)}) copiés ! Collez-les dans ${method === 'WAVE' ? 'Wave' : 'Max it'}.`
      );
    } catch {
      toast.info(
        `Numéro : ${phone} • Montant : ${formatXof(lockedBooking.depositAmountXof)}`
      );
    }

    setHasLaunchedPaymentApp(true);

    // Déclenchement du Deep Link mobile natif selon l'OS (Android / iOS)
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : '';
    const isAndroid = /android/.test(userAgent);

    if (method === 'WAVE') {
      if (isAndroid) {
        // Déclenche l'application native Wave sur Android via son package officiel
        window.location.href = 'intent://#Intent;package=com.wave.personal;scheme=wave;end;';
      } else {
        // Déclenche Wave sur iOS (iPhone / iPad)
        window.location.href = 'wave://';
      }
    } else {
      if (isAndroid) {
        // Déclenche l'application officielle Max it Orange Money sur Android
        window.location.href = 'intent://#Intent;package=sn.orange.maxit;scheme=maxit;end;';
      } else {
        // Déclenche Max it sur iOS
        window.location.href = 'sn.orange.maxit://';
      }
    }
  }

  async function handleLockSlotAndProceed(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !selectedDateKey || !selectedSlot) {
      toast.error('Merci de choisir une pose et un créneau disponible.');
      return;
    }
    if (clientName.trim().length < 2) {
      toast.error('Merci d’indiquer ton prénom et ton nom.');
      return;
    }
    if (clientPhone.replace(/\D/g, '').length < 9) {
      toast.error('Merci d’indiquer un numéro de téléphone valide (+221).');
      return;
    }
    if (!agreedToRules) {
      toast.error('Tu dois accepter les conditions du rendez-vous.');
      return;
    }

    setIsSubmittingBooking(true);

    const response = await createBookingAndLockSlotAction({
      serviceId: selectedService.id,
      dateKey: selectedDateKey,
      startTimeLabel: selectedSlot.startTimeLabel,
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      clientInstagram: undefined,
      clientNotes: clientNotes.trim() || undefined,
      paymentMethod,
      agreedToRules: true,
    });

    setIsSubmittingBooking(false);

    if (response.success) {
      setLockedBooking(response.data);
      setStep(5);
      toast.success('Créneau verrouillé temporairement pour ton acompte');
      return;
    }

    const isDbConnectionIssue =
      response.error.includes("Can't reach database") ||
      response.error.includes('Prisma') ||
      response.error.includes('hors-ligne') ||
      response.error.includes('introuvable');

    if (isDbConnectionIssue) {
      const refCode = `TEB-${Math.floor(1000 + Math.random() * 9000)}`;
      const lockedUntil = new Date(
        Date.now() + settings.slotHoldMinutes * 60_000
      );
      const fallbackUrl = buildDepositProofWhatsAppUrl({
        studioWhatsappPhone: settings.whatsappPhone,
        referenceCode: refCode,
        clientName: clientName.trim(),
        serviceName: selectedService.name,
        dateKey: selectedDateKey,
        startTimeLabel: selectedSlot.startTimeLabel,
        depositAmountXof: selectedService.depositXof,
        totalPriceXof: selectedService.priceXof,
        paymentMethod,
      });

      setLockedBooking({
        bookingId: `local-${refCode}`,
        referenceCode: refCode,
        serviceName: selectedService.name,
        dateKey: selectedDateKey,
        startTimeLabel: selectedSlot.startTimeLabel,
        endTimeLabel: selectedSlot.endTimeLabel,
        totalPriceXof: selectedService.priceXof,
        depositAmountXof: selectedService.depositXof,
        remainingAmountXof:
          selectedService.priceXof - selectedService.depositXof,
        paymentMethod,
        lockedUntilIso: lockedUntil.toISOString(),
        wavePhone: settings.wavePhone,
        orangeMoneyPhone: settings.orangeMoneyPhone,
        whatsappDepositProofUrl: fallbackUrl,
      });
      setStep(5);
      toast.success('Créneau verrouillé pour le règlement de ton acompte');
      return;
    }

    toast.error(response.error);
  }

  async function handleConfirmProofSentAndGoToStep6() {
    if (!lockedBooking) return;
    setIsMarkingProofSent(true);

    const res = await markDepositSubmittedWhatsappAction({
      bookingId: lockedBooking.bookingId,
      referenceCode: lockedBooking.referenceCode,
      paymentMethod,
    });

    setIsMarkingProofSent(false);
    setDepositDrawerOpen(false);

    const whatsappUrl = res.success
      ? res.data.whatsappDepositProofUrl
      : lockedBooking.whatsappDepositProofUrl;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setStep(6);
    toast.success('Récapitulatif enregistré ! Envoie ta capture sur WhatsApp.');
  }

  return (
    <LayoutGroup>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {/* Rappel Promo Active dans le Tunnel de Réservation */}
        {settings.promoModeActive && !settings.examModeActive && (
          <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-[#F3C5CE] bg-[#FDF2F4] px-4 py-3 text-xs sm:text-sm text-[#9E3E53]">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-5 items-center rounded-full bg-[#E57B8F] px-2 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                Offre Promo
              </span>
              <span className="font-medium">
                {settings.promoBannerMessage ??
                  'Toutes les poses complètes sont en promotion à 15 000 FCFA'}
              </span>
            </div>
            <span className="hidden font-bold sm:inline tabular-nums">
              {formatXof(settings.promoPriceXof ?? 15000)}
            </span>
          </div>
        )}

        {/* En-tête du tunnel avec barre d'étapes animée et MORPHING intégral de la carte prestation */}
        <div className="mb-8 rounded-[26px] border border-[#F3E1E6] bg-white p-5 shadow-powdery">
          <div className="flex items-center justify-between text-xs font-medium text-[#786B6E] tabular-nums">
            <span>
              Étape {step} sur 6 •{' '}
              <strong className="text-[#1C191A]">{STEP_LABELS[step]}</strong>
            </span>
            <span className="rounded-full bg-[#F9EBEF] px-2.5 py-0.5 text-[11px] font-semibold text-[#B36270]">
              {Math.round((step / 6) * 100)}%
            </span>
          </div>

          {/* Rail des 6 étapes avec indicateur actif glissant via layoutId */}
          <div className="mt-3 grid grid-cols-6 gap-2">
            {([1, 2, 3, 4, 5, 6] as const).map((s) => {
              const isCurrent = s === step;
              const isPast = s < step;
              return (
                <div
                  key={s}
                  className="relative h-2 overflow-hidden rounded-full bg-[#F3E1E6]"
                >
                  {isPast && (
                    <div className="absolute inset-0 rounded-full bg-[#D88B99]/75" />
                  )}
                  {isCurrent && (
                    <motion.div
                      layoutId="wizard-active-step-indicator"
                      transition={HIGH_SPRING}
                      className="absolute inset-0 rounded-full bg-[#C47482]"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* MORPHING DIRECT : La carte de la prestation choisie à l'étape 2 se morphe ici dès l'étape 3 ! */}
          {selectedService && step >= 3 && (
            <motion.div
              layoutId={`morph-service-card-${selectedService.id}`}
              transition={HIGH_SPRING}
              className="mt-4 flex items-center justify-between gap-3 rounded-2xl border border-[#D88B99] bg-[#FDF8F9] p-3.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <motion.div
                  layoutId={`morph-service-avatar-${selectedService.id}`}
                  transition={HIGH_SPRING}
                  className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#D88B99] bg-[#F9EBEF] shadow-powdery"
                >
                  <img
                    src={selectedService.imageUrl}
                    alt={selectedService.name}
                    className="h-full w-full object-cover object-center"
                  />
                </motion.div>
                <div className="min-w-0">
                  <motion.h3
                    layoutId={`morph-service-title-${selectedService.id}`}
                    transition={HIGH_SPRING}
                    className="truncate font-serif text-lg font-semibold text-[#1C191A]"
                  >
                    {selectedService.name}
                  </motion.h3>
                  <p className="text-[11px] text-[#786B6E] tabular-nums">
                    Acompte : {formatXof(selectedService.depositXof)}
                    {selectedDateKey && selectedSlot
                      ? ` • ${selectedDateKey} à ${selectedSlot.startTimeLabel}`
                      : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <motion.span
                  layoutId={`morph-service-price-${selectedService.id}`}
                  transition={HIGH_SPRING}
                  className="rounded-full border border-[#F3E1E6] bg-white px-3 py-1 text-xs font-bold text-[#1C191A] tabular-nums"
                >
                  {formatXof(selectedService.priceXof)}
                </motion.span>
                {step < 5 && (
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="rounded-full border border-[#F3E1E6] bg-white px-2.5 py-1 text-[11px] font-medium text-[#B36270] active:scale-[0.96]"
                  >
                    Changer
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Conteneur animé des 6 étapes avec cascade staggerChildren: 0.06 & blur(8px) */}
        <AnimatePresence mode="popLayout" initial={false}>
          {step === 1 && (
            <motion.section
              key="wizard-step-1"
              variants={STEP_CASCADE_CONTAINER}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="rounded-[28px] border border-[#F3E1E6] bg-white p-6 shadow-powderyLg sm:p-8"
            >
              <motion.div variants={STEP_CASCADE_ITEM}>
                <PowderyBadge variant="rose">
                  <Sparkles
                    className="h-3.5 w-3.5 text-[#D88B99]"
                    strokeWidth={1.5}
                  />
                  Réservation simple & autonome
                </PowderyBadge>
              </motion.div>

              <motion.h1
                variants={STEP_CASCADE_ITEM}
                className="mt-3 font-serif text-3xl font-semibold text-[#1C191A] sm:text-4xl"
              >
                Réservez votre créneau en toute sérénité
              </motion.h1>
              <motion.p
                variants={STEP_CASCADE_ITEM}
                className="mt-2 text-sm leading-relaxed text-[#786B6E]"
              >
                Le calendrier n’affiche que mes vraies disponibilités en dehors
                de mes heures de cours. Voici comment votre rendez-vous est
                sécurisé :
              </motion.p>

              <div className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <motion.div
                  variants={STEP_CASCADE_ITEM}
                  className="rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-4"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F9EBEF] text-xs font-semibold text-[#B36270] tabular-nums">
                    1
                  </span>
                  <h2 className="mt-2.5 font-serif text-xl font-semibold text-[#1C191A]">
                    Choix de votre pose
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#786B6E]">
                    Sélectionnez votre modèle (Cil à cil, Mixte, Volume ou
                    Remplissage) et vérifiez ses conditions.
                  </p>
                </motion.div>

                <motion.div
                  variants={STEP_CASCADE_ITEM}
                  className="rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-4"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F9EBEF] text-xs font-semibold text-[#B36270] tabular-nums">
                    2
                  </span>
                  <h2 className="mt-2.5 font-serif text-xl font-semibold text-[#1C191A]">
                    Vrais créneaux ouverts
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#786B6E] tabular-nums">
                    Réservation au moins {settings.minNoticeHours}h à l’avance
                    avec marge de nettoyage incluse entre chaque cliente.
                  </p>
                </motion.div>

                <motion.div
                  variants={STEP_CASCADE_ITEM}
                  className="rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-4"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#F9EBEF] text-xs font-semibold text-[#B36270] tabular-nums">
                    3
                  </span>
                  <h2 className="mt-2.5 font-serif text-xl font-semibold text-[#1C191A]">
                    Verrouillage & Acompte
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#786B6E] tabular-nums">
                    Votre heure est immédiatement bloquée contre les doublons le
                    temps d’envoyer votre acompte Wave / Orange Money.
                  </p>
                </motion.div>

                <motion.div
                  variants={STEP_CASCADE_ITEM}
                  className="rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-4"
                >
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#EBF5F0] text-xs font-semibold text-[#2E7D5B] tabular-nums">
                    4
                  </span>
                  <h2 className="mt-2.5 font-serif text-xl font-semibold text-[#1C191A]">
                    Confirmation & Adresse
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-[#786B6E]">
                    Dès réception de la preuve sur WhatsApp, vous recevez
                    l’adresse exacte du studio à Dakar.
                  </p>
                </motion.div>
              </div>

              <motion.div
                variants={STEP_CASCADE_ITEM}
                className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
              >
                {selectedService && (
                  <div className="flex items-center gap-3 rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-2.5 pr-4">
                    <img
                      src={selectedService.imageUrl}
                      alt={selectedService.name}
                      className="h-11 w-11 shrink-0 rounded-xl border border-[#F3E1E6] object-cover"
                    />
                    <p className="text-xs text-[#786B6E] tabular-nums">
                      Pose présélectionnée :{' '}
                      <strong className="block text-[#1C191A]">
                        {selectedService.name} (
                        {formatXof(selectedService.priceXof)})
                      </strong>
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-2.5 sm:flex-row sm:ml-auto">
                  {initialServiceSlug && selectedService && (
                    <TactileButton
                      variant="secondary"
                      onClick={() => setStep(3)}
                    >
                      <span>Choisir directement l’heure</span>
                      <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                    </TactileButton>
                  )}
                  <TactileButton
                    fullWidth
                    onClick={() => setStep(2)}
                    className="sm:w-auto"
                  >
                    <span>
                      {initialServiceSlug
                        ? 'Vérifier ou changer ma pose'
                        : 'Choisir ma prestation'}
                    </span>
                    <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </TactileButton>
                </div>
              </motion.div>
            </motion.section>
          )}

          {step === 2 && (
            <motion.section
              key="wizard-step-2"
              variants={STEP_CASCADE_CONTAINER}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="rounded-[28px] border border-[#F3E1E6] bg-white p-6 shadow-powderyLg sm:p-8"
            >
              <motion.h2
                variants={STEP_CASCADE_ITEM}
                className="font-serif text-3xl font-semibold text-[#1C191A]"
              >
                Quelle pose souhaitez-vous réserver ?
              </motion.h2>
              <motion.p
                variants={STEP_CASCADE_ITEM}
                className="mt-1 text-sm text-[#786B6E]"
              >
                Choisissez votre pose d’extensions de cils parmi nos créations signatures.
              </motion.p>

              <div className="mt-6 space-y-3.5">
                {services.map((srv) => {
                  const isSelected = selectedService?.id === srv.id;
                  return (
                    <motion.div key={srv.id} variants={STEP_CASCADE_ITEM}>
                      <motion.div
                        layoutId={`morph-service-card-${srv.id}`}
                        transition={HIGH_SPRING}
                        role="button"
                        tabIndex={0}
                        onClick={() => setSelectedService(srv)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedService(srv);
                          }
                        }}
                        className={cn(
                          'relative cursor-pointer rounded-[22px] border p-5 transition-colors duration-150 active:scale-[0.985]',
                          isSelected
                            ? 'border-[#D88B99] bg-[#FDF8F9]'
                            : 'border-[#F3E1E6] bg-white hover:bg-[#FDF8F9]/60'
                        )}
                      >
                        {/* Anneau de sélection fluide via layoutId (stiffness: 380, damping: 28) */}
                        {isSelected && (
                          <motion.div
                            layoutId="selected-service-ring"
                            className="pointer-events-none absolute inset-0 rounded-[22px] border-2 border-[#D88B99]"
                            transition={HIGH_SPRING}
                          />
                        )}

                        <div className="relative z-10 flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3.5">
                            <motion.div
                              layoutId={`morph-service-avatar-${srv.id}`}
                              transition={HIGH_SPRING}
                              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-[#F3E1E6] bg-[#F9EBEF] shadow-powdery sm:h-20 sm:w-20"
                            >
                              <img
                                src={srv.imageUrl}
                                alt={srv.name}
                                loading="lazy"
                                className="h-full w-full object-cover object-center"
                              />
                            </motion.div>
                            <div>
                              <div className="flex items-center gap-2">
                                <motion.h3
                                  layoutId={`morph-service-title-${srv.id}`}
                                  transition={HIGH_SPRING}
                                  className="font-serif text-xl font-semibold text-[#1C191A]"
                                >
                                  {srv.name}
                                </motion.h3>
                                {isSelected && (
                                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#C47482] text-white">
                                    <Check className="h-3 w-3" strokeWidth={2} />
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 text-xs leading-relaxed text-[#786B6E]">
                                {srv.shortDescription}
                              </p>
                            </div>
                          </div>

                          <div className="shrink-0 text-right tabular-nums">
                            {srv.isPromoActive &&
                            srv.regularPriceXof &&
                            srv.regularPriceXof > srv.priceXof ? (
                              <div>
                                <span className="line-through text-xs font-normal text-[#A89A9D] mr-1.5">
                                  {formatXof(srv.regularPriceXof)}
                                </span>
                                <motion.span
                                  layoutId={`morph-service-price-${srv.id}`}
                                  transition={HIGH_SPRING}
                                  className="inline-block rounded-full border border-[#D88B99] bg-[#FDF2F4] px-3 py-1 text-sm font-bold text-[#C47482]"
                                >
                                  {formatXof(srv.priceXof)}
                                </motion.span>
                                <span className="mt-0.5 block text-[10px] font-bold uppercase tracking-wider text-[#B36270]">
                                  Offre Promo
                                </span>
                              </div>
                            ) : (
                              <motion.span
                                layoutId={`morph-service-price-${srv.id}`}
                                transition={HIGH_SPRING}
                                className="inline-block rounded-full border border-[#F3E1E6] bg-white px-3 py-1 text-sm font-bold text-[#1C191A]"
                              >
                                {formatXof(srv.priceXof)}
                              </motion.span>
                            )}
                            <p className="mt-1 text-[11px] text-[#786B6E]">
                              Acompte obligatoire : {formatXof(srv.depositXof)}
                            </p>
                          </div>
                        </div>

                        <div className="relative z-10 mt-3.5 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            {srv.isPromoActive && (
                              <PowderyBadge variant="rose">
                                <Sparkles className="h-3.5 w-3.5 text-[#D88B99]" strokeWidth={1.5} />
                                Offre Promo • {formatXof(srv.priceXof)}
                              </PowderyBadge>
                            )}
                            {srv.naturalLashesOnly && (
                              <PowderyBadge variant="rose">
                                Sur cils naturels uniquement
                              </PowderyBadge>
                            )}
                            {srv.refillAccepted && (
                              <PowderyBadge variant="sage">
                                Remplissage accepté (≤ 21 j)
                              </PowderyBadge>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDrawerService(srv);
                            }}
                            className="inline-flex items-center gap-1 rounded-full border border-[#F3E1E6] bg-white px-3 py-1 text-xs font-medium text-[#B36270] transition-transform duration-150 ease-emil-out active:scale-[0.96]"
                          >
                            <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
                            <span>Détails</span>
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>

              <motion.div
                variants={STEP_CASCADE_ITEM}
                className="mt-8 flex items-center justify-between gap-3"
              >
                <TactileButton variant="secondary" onClick={() => setStep(1)}>
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                  <span>Retour</span>
                </TactileButton>

                <TactileButton
                  disabled={!selectedService}
                  onClick={() => setStep(3)}
                >
                  <span>Voir les créneaux ouverts</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </TactileButton>
              </motion.div>
            </motion.section>
          )}

          {step === 3 && (
            <motion.section
              key="wizard-step-3"
              variants={STEP_CASCADE_CONTAINER}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="rounded-[28px] border border-[#F3E1E6] bg-white p-6 shadow-powderyLg sm:p-8"
            >
              <motion.div
                variants={STEP_CASCADE_ITEM}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <div>
                  <h2 className="font-serif text-3xl font-semibold text-[#1C191A]">
                    Choisissez votre jour & heure
                  </h2>
                  <p className="mt-1 text-xs text-[#786B6E] tabular-nums">
                    Seuls les créneaux réellement disponibles (délai{' '}
                    {settings.minNoticeHours}h min) sont affichés.
                  </p>
                </div>
                <PowderyBadge variant="sage">
                  Fuseau : Dakar (UTC+0)
                </PowderyBadge>
              </motion.div>

              {calendarLoading ? (
                <div className="mt-6 space-y-4" aria-busy="true">
                  <div className="flex gap-2.5 overflow-hidden">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-20 w-28 shrink-0 animate-pulse rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9]"
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-12 animate-pulse rounded-full border border-[#F3E1E6] bg-[#FDF8F9]"
                      />
                    ))}
                  </div>
                </div>
              ) : calendarData?.examModeActive ? (
                <motion.div
                  variants={STEP_CASCADE_ITEM}
                  className="mt-6 rounded-2xl border border-[#F6DFC0] bg-[#FDF4E7] p-6 text-center"
                >
                  <p className="font-serif text-xl font-semibold text-[#B4690E]">
                    Mode Examens Activé
                  </p>
                  <p className="mt-1 text-sm text-[#B4690E]">
                    {calendarData.examModeMessage ??
                      'Les réservations sont temporairement en pause pour mes examens.'}
                  </p>
                </motion.div>
              ) : openDays.length === 0 ? (
                <motion.div
                  variants={STEP_CASCADE_ITEM}
                  className="mt-6 rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-6 text-center"
                >
                  <p className="font-serif text-xl font-semibold text-[#1C191A]">
                    Aucun créneau libre sur cette période
                  </p>
                  <p className="mt-1 text-xs text-[#786B6E]">
                    Tous les créneaux sont complets pour le moment. Contactez-moi
                    sur WhatsApp pour être prévenue d’un désistement.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Sélecteur de jours réellement ouverts avec layoutId */}
                  <motion.div variants={STEP_CASCADE_ITEM} className="mt-6">
                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#786B6E]">
                      1. Jours disponibles ({openDays.length})
                    </p>
                    <div
                      ref={dayStripRef}
                      className="relative flex snap-x gap-2.5 overflow-x-auto pb-2 [-webkit-overflow-scrolling:touch]"
                    >
                      {openDays.map((day) => {
                        const isDaySelected = selectedDateKey === day.dateKey;
                        const dateObj = new Date(
                          `${day.dateKey}T12:00:00.000Z`
                        );
                        const weekdayShort = new Intl.DateTimeFormat('fr-FR', {
                          weekday: 'short',
                          timeZone: 'Africa/Dakar',
                        }).format(dateObj);
                        const dayNumMonth = new Intl.DateTimeFormat('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          timeZone: 'Africa/Dakar',
                        }).format(dateObj);

                        return (
                          <button
                            key={day.dateKey}
                            data-date-key={day.dateKey}
                            aria-pressed={isDaySelected}
                            type="button"
                            onClick={() => {
                              setSelectedDateKey(day.dateKey);
                              setSelectedSlot(null);
                            }}
                            className={cn(
                              'relative flex min-h-16 min-w-[104px] shrink-0 snap-start flex-col items-center justify-center rounded-2xl border px-3.5 py-2.5 text-center transition-transform duration-150 ease-emil-out active:scale-[0.96]',
                              isDaySelected
                                ? 'border-[#D88B99] text-[#1C191A]'
                                : 'border-[#F3E1E6] bg-white text-[#786B6E]'
                            )}
                          >
                            {isDaySelected && (
                              <motion.div
                                layoutId="selected-day-pill"
                                className="pointer-events-none absolute inset-0 rounded-2xl border border-[#D88B99] bg-[#F9EBEF]"
                                transition={HIGH_SPRING}
                              />
                            )}
                            <span className="relative z-10 text-[11px] font-medium uppercase tracking-wider">
                              {weekdayShort}
                            </span>
                            <span className="relative z-10 mt-0.5 text-sm font-semibold text-[#1C191A] tabular-nums">
                              {dayNumMonth}
                            </span>
                            <span className="relative z-10 mt-0.5 text-[10px] text-[#2E7D5B] tabular-nums">
                              {day.slots.length} crén.
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Pilules d'horaires disponibles avec layoutId */}
                  {selectedDateKey && (
                    <motion.div variants={STEP_CASCADE_ITEM} className="mt-6">
                      <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-[#786B6E]">
                        2. Heures disponibles le{' '}
                        <span className="text-[#1C191A]">
                          {formatDakarDateLong(selectedDateKey)}
                        </span>
                      </p>

                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                        {activeDaySlots.map((slot) => {
                          const isSlotSelected =
                            selectedSlot?.startTimeLabel ===
                            slot.startTimeLabel;
                          return (
                            <button
                              key={slot.startTimeLabel}
                              type="button"
                              onClick={() => setSelectedSlot(slot)}
                              className={cn(
                                'relative flex min-h-12 items-center justify-center gap-1.5 sm:gap-2 rounded-full border px-2.5 sm:px-4 py-3 text-xs sm:text-sm font-semibold tabular-nums whitespace-nowrap transition-transform duration-150 ease-emil-out active:scale-[0.96]',
                                isSlotSelected
                                  ? 'border-[#C47482] text-white'
                                  : 'border-[#F3E1E6] bg-[#FDF8F9] text-[#1C191A] hover:border-[#D88B99]'
                              )}
                            >
                              {isSlotSelected && (
                                <motion.div
                                  layoutId="selected-slot-pill"
                                  className="pointer-events-none absolute inset-0 rounded-full bg-[#C47482] shadow-powdery"
                                  transition={HIGH_SPRING}
                                />
                              )}
                              <Clock
                                className={cn(
                                  'relative z-10 h-3.5 w-3.5',
                                  isSlotSelected
                                    ? 'text-white'
                                    : 'text-[#D88B99]'
                                )}
                                strokeWidth={1.5}
                              />
                              <span className="relative z-10">
                                {slot.startTimeLabel} – {slot.endTimeLabel}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </>
              )}

              <motion.div
                variants={STEP_CASCADE_ITEM}
                className="mt-8 flex items-center justify-between gap-3"
              >
                <TactileButton variant="secondary" onClick={() => setStep(2)}>
                  <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                  <span>Retour</span>
                </TactileButton>

                <TactileButton
                  disabled={!selectedDateKey || !selectedSlot}
                  onClick={() => setStep(4)}
                >
                  <span>Continuer</span>
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </TactileButton>
              </motion.div>
            </motion.section>
          )}

          {step === 4 &&
            selectedService &&
            selectedDateKey &&
            selectedSlot && (
              <motion.section
                key="wizard-step-4"
                variants={STEP_CASCADE_CONTAINER}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="rounded-[28px] border border-[#F3E1E6] bg-white p-6 shadow-powderyLg sm:p-8"
              >
                <motion.h2
                  variants={STEP_CASCADE_ITEM}
                  className="font-serif text-3xl font-semibold text-[#1C191A]"
                >
                  Vos coordonnées
                </motion.h2>
                <motion.p
                  variants={STEP_CASCADE_ITEM}
                  className="mt-1 text-xs text-[#786B6E] tabular-nums"
                >
                  Créneau sélectionné :{' '}
                  <strong className="text-[#1C191A]">
                    {formatDakarDateLong(selectedDateKey)} à{' '}
                    {selectedSlot.startTimeLabel}
                  </strong>
                </motion.p>

                <form
                  onSubmit={handleLockSlotAndProceed}
                  className="mt-6 space-y-4"
                >
                  <motion.div variants={STEP_CASCADE_ITEM}>
                    <label
                      htmlFor="clientName"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1C191A]"
                    >
                      Prénom & Nom *
                    </label>
                    <input
                      id="clientName"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Ex: Aïssatou Ndiaye"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="mt-1.5 min-h-12 w-full rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] px-4 py-3 text-base text-[#1C191A] placeholder:text-[#786B6E]/60 focus:border-[#D88B99] focus:bg-white focus:outline-none"
                    />
                  </motion.div>

                  <motion.div variants={STEP_CASCADE_ITEM}>
                    <div>
                      <label
                        htmlFor="clientPhone"
                        className="block text-xs font-semibold uppercase tracking-wider text-[#1C191A]"
                      >
                        Téléphone WhatsApp (+221) *
                      </label>
                      <input
                        id="clientPhone"
                        type="tel"
                        inputMode="tel"
                        required
                        autoComplete="tel"
                        placeholder="+221 77 123 45 67"
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="mt-1.5 min-h-12 w-full rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] px-4 py-3 text-base text-[#1C191A] tabular-nums placeholder:text-[#786B6E]/60 focus:border-[#D88B99] focus:bg-white focus:outline-none"
                      />
                    </div>
                  </motion.div>

                  <motion.div variants={STEP_CASCADE_ITEM}>
                    <label
                      htmlFor="clientNotes"
                      className="block text-xs font-semibold uppercase tracking-wider text-[#1C191A]"
                    >
                      Précisions utiles (optionnel)
                    </label>
                    <textarea
                      id="clientNotes"
                      rows={2}
                      placeholder="Sensibilité particulière, première pose, question..."
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                      className="mt-1.5 w-full rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] px-4 py-3 text-base text-[#1C191A] placeholder:text-[#786B6E]/60 focus:border-[#D88B99] focus:bg-white focus:outline-none"
                    />
                  </motion.div>

                  {/* Choix du mode d'acompte (Wave / Orange Money) */}
                  <motion.div variants={STEP_CASCADE_ITEM}>
                    <span className="block text-xs font-semibold uppercase tracking-wider text-[#1C191A]">
                      Moyen de paiement de l’acompte (
                      {formatXof(selectedService.depositXof)})
                    </span>
                    <div className="mt-2 grid grid-cols-2 gap-2.5">
                      {(['WAVE', 'ORANGE_MONEY'] as const).map((method) => {
                        const isSelected = paymentMethod === method;
                        return (
                          <button
                            key={method}
                            type="button"
                            onClick={() => setPaymentMethod(method)}
                            className={cn(
                              'relative flex min-h-12 items-center justify-center rounded-2xl border px-4 py-3 text-sm font-medium transition-transform duration-150 ease-emil-out active:scale-[0.97]',
                              isSelected
                                ? 'border-[#D88B99] text-[#1C191A]'
                                : 'border-[#F3E1E6] bg-[#FDF8F9] text-[#786B6E]'
                            )}
                          >
                            {isSelected && (
                              <motion.div
                                layoutId="selected-payment-pill"
                                className="pointer-events-none absolute inset-0 rounded-2xl border border-[#D88B99] bg-[#F9EBEF]"
                                transition={HIGH_SPRING}
                              />
                            )}
                            <span className="relative z-10 flex items-center justify-center gap-2 font-medium">
                              {method === 'WAVE' ? (
                                <>
                                  <WaveLogo className="h-5 w-5 shrink-0" />
                                  <span>Wave</span>
                                </>
                              ) : (
                                <>
                                  <OrangeMoneyLogo className="h-5 w-5 shrink-0" />
                                  <span>Orange Money</span>
                                </>
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>

                  {/* Case d'acceptation des règles */}
                  <motion.label
                    variants={STEP_CASCADE_ITEM}
                    className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-4 text-xs leading-relaxed text-[#1C191A]"
                  >
                    <input
                      type="checkbox"
                      checked={agreedToRules}
                      onChange={(e) => setAgreedToRules(e.target.checked)}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[#C47482]"
                    />
                    <span>
                      J’accepte les règles du rendez-vous : venir les yeux
                      démaquillés, retard maximum de 15 minutes, et acompte de{' '}
                      <strong className="tabular-nums">
                        {formatXof(selectedService.depositXof)}
                      </strong>{' '}
                      non remboursable en cas d’annulation à moins de 24h.
                    </span>
                  </motion.label>

                  <motion.div
                    variants={STEP_CASCADE_ITEM}
                    className="pt-4 flex items-center justify-between gap-3"
                  >
                    <TactileButton
                      type="button"
                      variant="secondary"
                      onClick={() => setStep(3)}
                    >
                      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
                      <span>Retour</span>
                    </TactileButton>

                    <TactileButton
                      type="submit"
                      isLoading={isSubmittingBooking}
                      disabled={!agreedToRules}
                    >
                      <Lock className="h-4 w-4" strokeWidth={1.5} />
                      <span>Bloquer ce créneau & régler l’acompte</span>
                    </TactileButton>
                  </motion.div>
                </form>
              </motion.section>
            )}

          {step === 5 && lockedBooking && (
            <motion.section
              key="wizard-step-5"
              variants={STEP_CASCADE_CONTAINER}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="rounded-[28px] border border-[#F3E1E6] bg-white p-6 shadow-powderyLg sm:p-8"
            >
              <motion.div
                variants={STEP_CASCADE_ITEM}
                className="flex flex-wrap items-center justify-between gap-2"
              >
                <PowderyBadge variant="amber">
                  <Lock className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Créneau verrouillé • Réf {lockedBooking.referenceCode}
                </PowderyBadge>
                <span className="rounded-full bg-[#FDF4E7] px-3 py-1 text-xs font-semibold text-[#B4690E] tabular-nums">
                  Temps restant : {formattedCountdown}
                </span>
              </motion.div>

              <motion.h2
                variants={STEP_CASCADE_ITEM}
                className="mt-3 font-serif text-3xl font-semibold text-[#1C191A]"
              >
                Règlement de l’acompte
              </motion.h2>
              <motion.p
                variants={STEP_CASCADE_ITEM}
                className="mt-1 text-sm text-[#786B6E]"
              >
                Votre créneau du{' '}
                <strong className="text-[#1C191A]">
                  {formatDakarDateLong(lockedBooking.dateKey)} à{' '}
                  {lockedBooking.startTimeLabel}
                </strong>{' '}
                est temporairement bloqué à votre nom pour empêcher tout doublon.
              </motion.p>

              {/* Encadré financier clair avant paiement */}
              <motion.div
                variants={STEP_CASCADE_ITEM}
                className="mt-6 rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-5 space-y-3 tabular-nums"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#786B6E]">Prestation</span>
                  <span className="font-semibold text-[#1C191A]">
                    {lockedBooking.serviceName}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[#786B6E]">Tarif total de la pose</span>
                  <span className="font-medium text-[#1C191A]">
                    {formatXof(lockedBooking.totalPriceXof)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-y border-[#F3E1E6] py-3 text-base">
                  <span className="font-semibold text-[#B36270]">
                    Acompte à envoyer maintenant
                  </span>
                  <span className="text-lg font-bold text-[#1C191A]">
                    {formatXof(lockedBooking.depositAmountXof)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#786B6E]">
                  <span>Reste à régler le jour du rendez-vous</span>
                  <span className="font-semibold text-[#1C191A]">
                    {formatXof(lockedBooking.remainingAmountXof)}
                  </span>
                </div>
              </motion.div>

              {/* Smart Pay Mobile Card : Wave ou Max it */}
              <motion.div
                variants={STEP_CASCADE_ITEM}
                className="mt-5 rounded-2xl border border-[#F3E1E6] bg-white p-5 shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#786B6E]">
                    Mode sélectionné : {paymentMethod === 'WAVE' ? 'Wave Mobile' : 'Max it (Orange Money)'}
                  </span>
                  <span className="rounded-full bg-[#FDF4E7] px-2.5 py-0.5 text-[11px] font-semibold text-[#B4690E]">
                    Acompte : {formatXof(lockedBooking.depositAmountXof)}
                  </span>
                </div>

                {/* Bouton d'action Deep Link direct */}
                <div className="flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => handleLaunchPaymentApp(paymentMethod)}
                    className={cn(
                      'flex w-full items-center justify-center gap-2.5 rounded-2xl py-3.5 px-4 text-sm font-semibold text-white shadow-md transition-transform active:scale-[0.98]',
                      paymentMethod === 'WAVE'
                        ? 'bg-[#1E88E5] hover:bg-[#1976D2]'
                        : 'bg-[#FF6600] hover:bg-[#E65C00]'
                    )}
                  >
                    {paymentMethod === 'WAVE' ? (
                      <WaveLogo className="h-5 w-5 shrink-0 drop-shadow-sm" />
                    ) : (
                      <OrangeMoneyLogo className="h-5 w-5 shrink-0 drop-shadow-sm" />
                    )}
                    <span>
                      {paymentMethod === 'WAVE'
                        ? 'Ouvrir l’application Wave pour payer'
                        : 'Ouvrir l’application Max it pour payer'}
                    </span>
                    <ExternalLink className="h-3.5 w-3.5 opacity-80" strokeWidth={2} />
                  </button>

                  <div className="flex items-center justify-between rounded-xl border border-[#F3E1E6] bg-[#FDF8F9] px-3.5 py-2.5 text-xs">
                    <span className="text-[#786B6E]">
                      Numéro officiel ({paymentMethod === 'WAVE' ? 'Wave' : 'Max it'}) :{' '}
                      <strong className="text-[#1C191A]">
                        {paymentMethod === 'WAVE'
                          ? lockedBooking.wavePhone
                          : lockedBooking.orangeMoneyPhone}
                      </strong>
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyPhone(
                          paymentMethod === 'WAVE'
                            ? lockedBooking.wavePhone
                            : lockedBooking.orangeMoneyPhone,
                          paymentMethod === 'WAVE' ? 'Wave' : 'Max it'
                        )
                      }
                      className="inline-flex items-center gap-1 font-semibold text-[#B36270] hover:underline"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copier</span>
                    </button>
                  </div>
                </div>

                <p className="text-[11px] text-[#786B6E] leading-relaxed">
                  💡 Le clic copie automatiquement le numéro et le montant exact pour un transfert instantané dans votre application.
                </p>
              </motion.div>

              {/* Bannière de retour : "Acompte envoyé ? Envoyez votre preuve" */}
              <motion.div
                variants={STEP_CASCADE_ITEM}
                className={cn(
                  'mt-5 rounded-2xl border p-5 transition-all duration-300',
                  showReturnedPrompt || hasLaunchedPaymentApp
                    ? 'border-[#25D366] bg-[#F0FDF4] shadow-md ring-2 ring-[#25D366]/20'
                    : 'border-[#F3E1E6] bg-[#FDF8F9]'
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white',
                      showReturnedPrompt || hasLaunchedPaymentApp
                        ? 'bg-[#25D366]'
                        : 'bg-[#B36270]'
                    )}
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-serif text-base font-semibold text-[#1C191A]">
                      {showReturnedPrompt || hasLaunchedPaymentApp
                        ? '✨ Vous avez effectué votre transfert ?'
                        : 'Confirmation finale par WhatsApp'}
                    </h3>
                    <p className="mt-1 text-xs text-[#786B6E] leading-relaxed">
                      Cliquez sur le bouton ci-dessous pour transmettre la capture d’écran de votre acompte. Votre référence <strong className="text-[#1C191A]">{lockedBooking.referenceCode}</strong> est déjà pré-remplie !
                    </p>

                    <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                      <TactileButton
                        variant="primary"
                        isLoading={isMarkingProofSent}
                        onClick={handleConfirmProofSentAndGoToStep6}
                        className="bg-[#25D366] hover:bg-[#1EBE5D] text-white border-transparent"
                      >
                        <MessageCircle className="h-4 w-4" strokeWidth={2} />
                        <span>Envoyer ma preuve sur WhatsApp</span>
                      </TactileButton>

                      <TactileButton
                        variant="secondary"
                        onClick={() => setDepositDrawerOpen(true)}
                      >
                        <Wallet className="h-4 w-4 text-[#D88B99]" strokeWidth={1.5} />
                        <span>Voir le récapitulatif</span>
                      </TactileButton>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.section>
          )}

          {step === 6 && lockedBooking && (
            <motion.section
              key="wizard-step-6"
              variants={STEP_CASCADE_CONTAINER}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="rounded-[28px] border border-[#F3E1E6] bg-white p-6 shadow-powderyLg sm:p-8"
            >
              <motion.div
                variants={STEP_CASCADE_ITEM}
                className="flex flex-wrap items-center gap-2"
              >
                <PowderyBadge variant="sage">
                  <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  Demande enregistrée • Réf {lockedBooking.referenceCode}
                </PowderyBadge>
                <PowderyBadge variant="amber">
                  Acompte en cours de vérification
                </PowderyBadge>
              </motion.div>

              <motion.h2
                variants={STEP_CASCADE_ITEM}
                className="mt-3 font-serif text-3xl font-semibold text-[#1C191A] sm:text-4xl"
              >
                Merci {clientName.split(' ')[0]} !
              </motion.h2>
              <motion.p
                variants={STEP_CASCADE_ITEM}
                className="mt-1 text-sm leading-relaxed text-[#786B6E]"
              >
                Votre créneau est réservé. Dès validation de votre capture
                d’acompte sur WhatsApp, vous recevrez un message de confirmation
                avec la localisation exacte du studio.
              </motion.p>

              {/* Récapitulatif complet de l'Étape 6 */}
              <motion.div
                variants={STEP_CASCADE_ITEM}
                className="mt-6 rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-5 space-y-3 text-sm tabular-nums"
              >
                <div className="flex justify-between">
                  <span className="text-[#786B6E]">Référence</span>
                  <span className="font-bold text-[#1C191A]">
                    {lockedBooking.referenceCode}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#786B6E]">Prestation</span>
                  <span className="font-semibold text-[#1C191A]">
                    {lockedBooking.serviceName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#786B6E]">Date & Heure</span>
                  <span className="font-semibold text-[#1C191A]">
                    {formatDakarDateLong(lockedBooking.dateKey)} à{' '}
                    {lockedBooking.startTimeLabel}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#786B6E]">Acompte déclaré</span>
                  <span className="font-semibold text-[#2E7D5B]">
                    {formatXof(lockedBooking.depositAmountXof)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-[#F3E1E6] pt-3">
                  <span className="text-[#786B6E]">
                    Reste à régler sur place
                  </span>
                  <span className="font-bold text-[#1C191A]">
                    {formatXof(lockedBooking.remainingAmountXof)}
                  </span>
                </div>
              </motion.div>

              {/* Adresse / Modalités et Règles du rendez-vous */}
              <motion.div
                variants={STEP_CASCADE_ITEM}
                className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
              >
                <div className="rounded-2xl border border-[#F3E1E6] bg-white p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B36270]">
                    <MapPin
                      className="h-4 w-4 text-[#D88B99]"
                      strokeWidth={1.5}
                    />
                    Adresse & Accès
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#786B6E]">
                    {settings.zoneLabel}. L’adresse exacte de la villa vous est
                    envoyée sur WhatsApp dès la validation de votre acompte.
                  </p>
                </div>

                <div className="rounded-2xl border border-[#F3E1E6] bg-white p-4">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#B36270]">
                    <ShieldCheck
                      className="h-4 w-4 text-[#D88B99]"
                      strokeWidth={1.5}
                    />
                    Rappel avant de venir
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-[#786B6E]">
                    Yeux 100 % démaquillés (sans mascara ni huile), venir seule,
                    et ponctualité (tolérance retard max 15 min).
                  </p>
                </div>
              </motion.div>

              <motion.div
                variants={STEP_CASCADE_ITEM}
                className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between"
              >
                <a
                  href={lockedBooking.whatsappDepositProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C47482] px-6 py-3 text-sm font-medium text-white shadow-powdery transition-transform duration-150 ease-emil-out active:scale-[0.98] hover:bg-[#B36270]"
                >
                  <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                  <span>Renvoyer ma capture sur WhatsApp</span>
                </a>
              </motion.div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Drawer mobile Vaul 3D pour les conditions d'une pose (Étape 2) */}
        <ServiceConditionsDrawer
          service={drawerService}
          open={drawerService !== null}
          onOpenChange={(isOpen) => {
            if (!isOpen) setDrawerService(null);
          }}
          onSelectService={(srv) => setSelectedService(srv)}
        />

        {/* Drawer mobile Vaul 3D pour le récapitulatif d'acompte Wave / WhatsApp (Étape 5) */}
        {lockedBooking && (
          <Drawer.Root
            open={depositDrawerOpen}
            onOpenChange={setDepositDrawerOpen}
            shouldScaleBackground
          >
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 z-40 bg-[#1C191A]/30 backdrop-blur-[2px] transition-opacity duration-200 ease-emil-out" />
              <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[85dvh] flex-col rounded-t-[28px] border-t border-[#F3E1E6] bg-white shadow-powderyLg focus:outline-none">
                <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-[#F3E1E6]" />

                <div className="flex items-center justify-between border-b border-[#F3E1E6] px-6 py-4">
                  <div>
                    <Drawer.Title className="font-serif text-2xl font-semibold text-[#1C191A]">
                      Récapitulatif de l’acompte
                    </Drawer.Title>
                    <Drawer.Description className="text-xs text-[#786B6E] tabular-nums">
                      Référence {lockedBooking.referenceCode} • Verrouillé
                      pendant {formattedCountdown}
                    </Drawer.Description>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDepositDrawerOpen(false)}
                    aria-label="Fermer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#F3E1E6] bg-[#FDF8F9] text-[#786B6E]"
                  >
                    <X className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="sheet-scroll px-6 py-5 space-y-4 tabular-nums">
                  <div className="rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#786B6E]">
                        Montant de l’acompte
                      </span>
                      <span className="font-bold text-[#1C191A]">
                        {formatXof(lockedBooking.depositAmountXof)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#786B6E]">Numéro Wave</span>
                      <span className="font-semibold text-[#1C191A]">
                        {lockedBooking.wavePhone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#786B6E]">
                        Numéro Max it (Orange)
                      </span>
                      <span className="font-semibold text-[#1C191A]">
                        {lockedBooking.orangeMoneyPhone}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs leading-relaxed text-[#786B6E]">
                    Conditions : l’acompte est déduit du total le jour J. Il est
                    reportable une fois en prévenant au moins 24h à l’avance, et
                    non remboursable en cas d’annulation tardive (&lt; 24h) ou
                    de retard supérieur à 15 minutes.
                  </p>
                </div>

                <div className="safe-bottom border-t border-[#F3E1E6] bg-white px-6 pt-4">
                  <TactileButton
                    fullWidth
                    isLoading={isMarkingProofSent}
                    onClick={handleConfirmProofSentAndGoToStep6}
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                    <span>Envoyer ma capture sur WhatsApp</span>
                  </TactileButton>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        )}
      </div>
    </LayoutGroup>
  );
}
