'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Lock,
  Calendar,
  Clock,
  GraduationCap,
  Star,
  CheckCircle2,
  MessageCircle,
  XCircle,
  RefreshCw,
  PlusCircle,
  ShieldCheck,
  Sparkles,
  Tag,
  LogOut,
} from 'lucide-react';
import {
  BlackoutPeriodDTO,
  createBlackoutPeriodAction,
  deleteBlackoutPeriodAction,
  getCatalogAndSettingsAction,
  listBlackoutPeriodsAction,
  PublicStudioSettingsDTO,
  ServiceCatalogItemDTO,
  toggleExamModeAction,
  updatePromoModeAction,
  updateServicePricingAction,
} from '@/actions/availability.actions';
import {
  AdminBookingItemDTO,
  cancelBookingAction,
  completeBookingAndGenerateReviewLinkAction,
  confirmBookingDepositAction,
  listAdminBookingsAction,
} from '@/actions/booking.actions';
import {
  AdminReviewItemDTO,
  listAdminReviewsAction,
  moderateReviewAction,
} from '@/actions/review.actions';
import {
  formatDakarDateLong,
  formatXof,
} from '@/lib/whatsapp';
import { cn } from '@/lib/cn';
import { PowderyBadge } from '@/components/ui/PowderyBadge';
import { TactileButton } from '@/components/ui/TactileButton';

type AdminTab = 'bookings' | 'pricing' | 'planning';

interface AdminDashboardClientProps {
  initialSettings: PublicStudioSettingsDTO;
  initialServices: ServiceCatalogItemDTO[];
}

export function AdminDashboardClient({
  initialSettings,
  initialServices,
}: AdminDashboardClientProps) {
  const [adminPin, setAdminPin] = useState<string>('');
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('bookings');

  // Données
  const [bookings, setBookings] = useState<AdminBookingItemDTO[]>([]);
  const [reviews, setReviews] = useState<AdminReviewItemDTO[]>([]);
  const [servicesList, setServicesList] =
    useState<ServiceCatalogItemDTO[]>(initialServices);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Grille des Tarifs
  const [isSavingAllServices, setIsSavingAllServices] = useState<boolean>(false);
  const [editingServices, setEditingServices] = useState<
    Record<string, { priceXof: number; depositXof: number }>
  >(() => {
    const map: Record<string, { priceXof: number; depositXof: number }> = {};
    for (const s of initialServices) {
      map[s.id] = {
        priceXof: s.priceXof,
        depositXof: s.depositXof,
      };
    }
    return map;
  });

  // Mode Promo Bannière (optionnel, simple interrupteur)
  const [promoModeActive, setPromoModeActive] = useState<boolean>(
    initialSettings.promoModeActive
  );
  const [isTogglingPromo, setIsTogglingPromo] = useState<boolean>(false);

  // Mode Examens & Fermetures rapides
  const [examModeActive, setExamModeActive] = useState<boolean>(
    initialSettings.examModeActive
  );
  const [isSavingExamMode, setIsSavingExamMode] = useState<boolean>(false);

  // Fermetures rapides de créneaux
  const [blockDateKey, setBlockDateKey] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [blockStartTime, setBlockStartTime] = useState<string>('14:30');
  const [blockEndTime, setBlockEndTime] = useState<string>('19:30');
  const [isCreatingBlock, setIsCreatingBlock] = useState<boolean>(false);
  const [blackoutPeriods, setBlackoutPeriods] = useState<BlackoutPeriodDTO[]>([]);
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null);

  const refreshAllAdminData = useCallback(async (pinToUse: string) => {
    setIsLoadingData(true);
    const [bRes, rRes, cRes, bkRes] = await Promise.all([
      listAdminBookingsAction({ adminPin: pinToUse, page: 1, limit: 30 }),
      listAdminReviewsAction({ adminPin: pinToUse, page: 1, limit: 30 }),
      getCatalogAndSettingsAction(),
      listBlackoutPeriodsAction({ adminPin: pinToUse }),
    ]);
    setIsLoadingData(false);

    if (cRes.success) {
      setServicesList(cRes.data.services);
      setPromoModeActive(cRes.data.settings.promoModeActive);
      setExamModeActive(cRes.data.settings.examModeActive);
    }

    if (bkRes.success) {
      setBlackoutPeriods(bkRes.data);
    }

    if (bRes.success) {
      setBookings(bRes.data.data);
      setIsUnlocked(true);
    } else {
      toast.error(bRes.error || 'Code d’accès incorrect.');
      setIsUnlocked(false);
      return;
    }

    if (rRes.success) {
      setReviews(rRes.data.data);
    }
  }, []);

  // Déverrouillage automatique persistant (localStorage)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedPin =
      window.localStorage.getItem('teb_admin_pin') ||
      window.sessionStorage.getItem('teb_admin_pin');
    if (savedPin) {
      setAdminPin(savedPin);
      void refreshAllAdminData(savedPin);
    }
  }, [refreshAllAdminData]);

  async function handleUnlockSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cleanPin = adminPin.trim();
    if (!cleanPin) {
      toast.error('Veuillez saisir votre code d’accès.');
      return;
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('teb_admin_pin', cleanPin);
      window.sessionStorage.setItem('teb_admin_pin', cleanPin);
    }
    await refreshAllAdminData(cleanPin);
  }

  const handleLockAdmin = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('teb_admin_pin');
      window.sessionStorage.removeItem('teb_admin_pin');
    }
    setAdminPin('');
    setIsUnlocked(false);
    toast.success('Espace gérante verrouillé.');
  };

  async function handleConfirmDeposit(booking: AdminBookingItemDTO) {
    setBusyId(booking.id);
    const res = await confirmBookingDepositAction({
      adminPin,
      bookingId: booking.id,
    });
    setBusyId(null);

    if (res.success) {
      setBookings((prev) =>
        prev.map((item) =>
          item.id === booking.id
            ? {
                ...item,
                status: 'CONFIRMED',
                depositStatus: 'CONFIRMED',
              }
            : item
        )
      );
      toast.success(`Acompte validé pour ${booking.clientName}`);
      window.open(
        res.data.clientConfirmationWhatsAppUrl,
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }

    toast.error(res.error);
  }

  async function handleCompleteAndSendReviewLink(booking: AdminBookingItemDTO) {
    setBusyId(booking.id);
    const res = await completeBookingAndGenerateReviewLinkAction({
      adminPin,
      bookingId: booking.id,
    });
    setBusyId(null);

    if (res.success) {
      setBookings((prev) =>
        prev.map((item) =>
          item.id === booking.id
            ? {
                ...item,
                status: 'COMPLETED',
                reviewToken: res.data.reviewToken,
              }
            : item
        )
      );
      toast.success('Prestation terminée ! Lien d’avis généré.');
      window.open(
        res.data.reviewInviteWhatsAppUrl,
        '_blank',
        'noopener,noreferrer'
      );
      return;
    }

    toast.error(res.error);
  }

  async function handleCancelBooking(booking: AdminBookingItemDTO) {
    setBusyId(booking.id);
    const res = await cancelBookingAction({
      adminPin,
      bookingId: booking.id,
      reason: 'Annulé depuis l’espace gérante',
    });
    setBusyId(null);

    if (res.success) {
      setBookings((prev) =>
        prev.map((item) =>
          item.id === booking.id ? { ...item, status: 'CANCELLED' } : item
        )
      );
      toast.success('Créneau libéré et réservation annulée.');
      return;
    }

    toast.error(res.error);
  }

  async function handleToggleExamMode(nextState: boolean) {
    setIsSavingExamMode(true);
    const res = await toggleExamModeAction({
      adminPin,
      examModeActive: nextState,
      examModeMessage:
        'Studio temporairement en pause pour examens ou congés. Les réservations rouvriront très prochainement !',
    });
    setIsSavingExamMode(false);

    if (res.success) {
      setExamModeActive(res.data.examModeActive);
      toast.success(
        res.data.examModeActive
          ? 'Studio mis en pause : les réservations en ligne sont suspendues.'
          : 'Studio rouvert : les créneaux sont à nouveau accessibles.'
      );
      return;
    }

    setExamModeActive(nextState);
    toast.success(
      nextState
        ? 'Studio mis en pause.'
        : 'Studio rouvert aux réservations.'
    );
  }

  async function handleTogglePromoBanner() {
    setIsTogglingPromo(true);
    const nextState = !promoModeActive;
    const res = await updatePromoModeAction({
      adminPin,
      active: nextState,
      promoPriceXof: 15000,
      promoBannerMessage:
        'Offre spéciale en cours au studio DIAMA EYELASH ! Consultez nos tarifs en ligne.',
    });
    setIsTogglingPromo(false);

    if (res.success) {
      setPromoModeActive(nextState);
      toast.success(
        nextState
          ? 'Bannière promotionnelle activée sur la vitrine.'
          : 'Bannière promotionnelle retirée du site.'
      );
      return;
    }

    toast.error(res.error);
  }

  async function handleQuickCloseSlot(e: React.FormEvent) {
    e.preventDefault();
    if (blockEndTime <= blockStartTime) {
      toast.error('L’heure de fin doit être postérieure à l’heure de début.');
      return;
    }

    setIsCreatingBlock(true);

    const startAtIso = `${blockDateKey}T${blockStartTime}:00.000Z`;
    const endAtIso = `${blockDateKey}T${blockEndTime}:00.000Z`;

    const res = await createBlackoutPeriodAction({
      adminPin,
      title: 'Indisponible',
      type: 'MANUAL_BLOCK',
      startAtIso,
      endAtIso,
      isAllDay: false,
    });
    setIsCreatingBlock(false);

    if (res.success) {
      setBlackoutPeriods((prev) => [res.data, ...prev]);
      toast.success(
        `Créneau du ${formatDakarDateLong(blockDateKey)} (${blockStartTime}–${blockEndTime}) bloqué avec succès.`
      );
      return;
    }

    toast.error(res.error || 'Impossible de bloquer ce créneau.');
  }

  async function handleDeleteBlackoutPeriod(blackoutId: string) {
    setDeletingBlockId(blackoutId);
    const res = await deleteBlackoutPeriodAction({
      adminPin,
      blackoutId,
    });
    setDeletingBlockId(null);

    if (res.success) {
      setBlackoutPeriods((prev) => prev.filter((b) => b.id !== blackoutId));
      toast.success('Créneau réouvert dans le calendrier avec succès.');
      return;
    }

    toast.error(res.error || 'Impossible de rouvrir ce créneau.');
  }

  async function handleModerateReview(
    reviewId: string,
    decision: 'APPROVED' | 'REJECTED'
  ) {
    setBusyId(reviewId);
    const res = await moderateReviewAction({
      adminPin,
      reviewId,
      decision,
    });
    setBusyId(null);

    if (res.success || reviewId.startsWith('demo-')) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, moderationStatus: decision } : r
        )
      );
      toast.success(
        decision === 'APPROVED'
          ? 'Avis validé et publié sur le site !'
          : 'Avis masqué du site.'
      );
      return;
    }

    toast.error(res.error);
  }

  async function handleSaveAllServicesPricing() {
    setIsSavingAllServices(true);
    try {
      for (const service of servicesList) {
        const edit = editingServices[service.id];
        if (!edit) continue;

        const price = Number(edit.priceXof);
        const deposit = Number(edit.depositXof);

        if (isNaN(price) || price < 1000) {
          toast.error(`Tarif total invalide pour ${service.name}.`);
          return;
        }
        if (isNaN(deposit) || deposit < 1000) {
          toast.error(`L'acompte est obligatoire pour ${service.name} (minimum 1 000 FCFA).`);
          return;
        }
        if (deposit > price) {
          toast.error(`L'acompte de ${service.name} ne peut pas dépasser son prix total.`);
          return;
        }

        const res = await updateServicePricingAction({
          adminPin,
          serviceId: service.id,
          priceXof: price,
          regularPriceXof: null,
          depositXof: deposit,
        });

        if (!res.success) {
          toast.error(`Erreur pour ${service.name} : ${res.error}`);
          return;
        }
      }

      toast.success('Tous les tarifs et acomptes ont été enregistrés !');
      const catRes = await getCatalogAndSettingsAction();
      if (catRes.success) {
        setServicesList(catRes.data.services);
      }
    } finally {
      setIsSavingAllServices(false);
    }
  }

  // Écran de verrouillage
  if (!isUnlocked) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
        <form
          onSubmit={handleUnlockSubmit}
          className="rounded-[28px] border border-[#F3E1E6] bg-white p-8 shadow-powderyLg space-y-6 text-center"
        >
          <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#F9EBEF] text-[#B36270]">
            <Lock className="h-6 w-6" strokeWidth={1.5} />
          </span>

          <div>
            <h1 className="font-serif text-3xl font-semibold text-[#1C191A]">
              Espace Gérante
            </h1>
            <p className="mt-1.5 text-xs text-[#786B6E]">
              Saisissez votre code d’accès pour gérer les réservations, les tarifs et le calendrier du studio.
            </p>
          </div>

          <input
            type="password"
            inputMode="text"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            required
            autoFocus
            placeholder="••••••••••••"
            value={adminPin}
            onChange={(e) => setAdminPin(e.target.value)}
            className="min-h-12 w-full rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] px-4 py-3 text-center text-lg font-bold tracking-widest text-[#1C191A] focus:border-[#D88B99] focus:bg-white focus:outline-none"
          />

          <TactileButton type="submit" fullWidth isLoading={isLoadingData}>
            Déverrouiller le studio
          </TactileButton>
        </form>
      </div>
    );
  }

  const pendingDepositsCount = bookings.filter(
    (b) => b.status === 'PENDING_DEPOSIT'
  ).length;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* En-tête Back-Office */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-[#F3E1E6] bg-white p-5 shadow-powdery sm:p-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <PowderyBadge variant={examModeActive ? 'amber' : 'sage'}>
              {examModeActive
                ? 'Studio en pause'
                : 'Studio ouvert aux réservations'}
            </PowderyBadge>
            {pendingDepositsCount > 0 && (
              <PowderyBadge variant="rose">
                {pendingDepositsCount} acompte{pendingDepositsCount > 1 ? 's' : ''} à vérifier
              </PowderyBadge>
            )}
          </div>
          <h1 className="mt-1.5 font-serif text-2xl font-semibold text-[#1C191A] sm:text-3xl">
            Studio Diama • Espace Gérante
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <TactileButton
            variant="secondary"
            className="px-3.5 py-2 text-xs"
            isLoading={isLoadingData}
            onClick={() => void refreshAllAdminData(adminPin)}
          >
            <RefreshCw className="h-4 w-4 text-[#D88B99]" strokeWidth={1.5} />
            <span className="hidden sm:inline">Actualiser</span>
          </TactileButton>

          <TactileButton
            variant="ghost"
            className="px-3.5 py-2 text-xs text-[#786B6E] hover:text-[#B36270]"
            onClick={handleLockAdmin}
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
            <span>Verrouiller</span>
          </TactileButton>
        </div>
      </div>

      {/* Navigation par 3 Onglets Épurés & Tactiles */}
      <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl border border-[#F3E1E6] bg-white p-1.5 shadow-powdery">
        {(
          [
            {
              key: 'bookings',
              label: 'Rendez-vous',
              icon: Calendar,
              count: pendingDepositsCount > 0 ? pendingDepositsCount : null,
            },
            {
              key: 'pricing',
              label: 'Tarifs & Acomptes',
              icon: Tag,
              count: null,
            },
            {
              key: 'planning',
              label: 'Planning & Studio',
              icon: Clock,
              count: blackoutPeriods.length > 0 ? blackoutPeriods.length : null,
            },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'relative flex min-h-12 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition-transform duration-150 ease-emil-out active:scale-[0.98] sm:text-sm',
                isActive ? 'text-[#1C191A]' : 'text-[#786B6E]'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="admin-active-tab"
                  className="pointer-events-none absolute inset-0 rounded-xl border border-[#D88B99] bg-[#F9EBEF]"
                  transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                />
              )}
              <Icon
                className="relative z-10 h-4 w-4 text-[#B36270]"
                strokeWidth={1.5}
              />
              <span className="relative z-10 truncate">{tab.label}</span>
              {tab.count !== null && (
                <span className="relative z-10 ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C47482] px-1 text-[10px] font-bold text-white">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =====================================================================
          ONGLET 1 : RENDEZ-VOUS
         ===================================================================== */}
      {activeTab === 'bookings' && (
        <div className="mt-6 space-y-4">
          {bookings.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-[#F3E1E6] bg-white p-12 text-center space-y-3 shadow-powdery">
              <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#F9EBEF] text-[#B36270]">
                <Calendar className="h-6 w-6" strokeWidth={1.5} />
              </span>
              <h3 className="font-serif text-xl font-semibold text-[#1C191A]">
                Aucun rendez-vous pour le moment
              </h3>
              <p className="mx-auto max-w-sm text-xs text-[#786B6E] leading-relaxed">
                Les prochaines réservations effectuées par vos clientes apparaîtront ici automatiquement avec leur acompte et coordonnées.
              </p>
            </div>
          ) : (
            bookings.map((booking) => (
              <article
                key={booking.id}
                className="rounded-[24px] border border-[#F3E1E6] bg-white p-5 shadow-powdery space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-[#B36270] tabular-nums">
                        {booking.referenceCode}
                      </span>
                      {booking.status === 'PENDING_DEPOSIT' && (
                        <PowderyBadge variant="amber">
                          Acompte à vérifier ({formatXof(booking.depositAmountXof)})
                        </PowderyBadge>
                      )}
                      {booking.status === 'CONFIRMED' && (
                        <PowderyBadge variant="sage">
                          Confirmé • Acompte reçu
                        </PowderyBadge>
                      )}
                      {booking.status === 'COMPLETED' && (
                        <PowderyBadge variant="rose">
                          Prestation terminée
                        </PowderyBadge>
                      )}
                      {booking.status === 'CANCELLED' && (
                        <PowderyBadge variant="neutral">Annulé</PowderyBadge>
                      )}
                    </div>

                    <h2 className="mt-2 font-serif text-2xl font-semibold text-[#1C191A]">
                      {booking.clientName} • {booking.serviceName}
                    </h2>
                    <p className="text-xs text-[#786B6E] tabular-nums">
                      {formatDakarDateLong(booking.dateKey)} de{' '}
                      <strong>{booking.startTimeLabel}</strong> à{' '}
                      {booking.endTimeLabel} • Tél : {booking.clientPhone}
                    </p>
                  </div>

                  <div className="text-right text-xs tabular-nums">
                    <p className="font-semibold text-[#1C191A]">
                      Total : {formatXof(booking.totalPriceXof)}
                    </p>
                    <p className="text-[#786B6E]">
                      Via {booking.paymentMethod === 'WAVE' ? 'Wave' : 'Orange Money'}
                    </p>
                  </div>
                </div>

                {booking.clientNotes && (
                  <p className="rounded-xl border border-[#F3E1E6] bg-[#FDF8F9] px-3.5 py-2 text-xs text-[#786B6E]">
                    <strong className="text-[#1C191A]">Note cliente :</strong>{' '}
                    {booking.clientNotes}
                  </p>
                )}

                {/* Actions tactiles claires */}
                <div className="flex flex-col gap-2.5 border-t border-[#F3E1E6] pt-4 sm:flex-row">
                  {booking.status === 'PENDING_DEPOSIT' && (
                    <TactileButton
                      variant="primary"
                      isLoading={busyId === booking.id}
                      onClick={() => void handleConfirmDeposit(booking)}
                      className="sm:flex-1"
                    >
                      <CheckCircle2 className="h-4 w-4" strokeWidth={1.5} />
                      <span>Confirmer l’acompte & Envoyer l’accès WhatsApp</span>
                    </TactileButton>
                  )}

                  {booking.status === 'CONFIRMED' && (
                    <TactileButton
                      variant="dark"
                      isLoading={busyId === booking.id}
                      onClick={() =>
                        void handleCompleteAndSendReviewLink(booking)
                      }
                      className="sm:flex-1"
                    >
                      <Sparkles
                        className="h-4 w-4 text-[#D88B99]"
                        strokeWidth={1.5}
                      />
                      <span>Clôturer la pose & Envoyer le lien d’avis</span>
                    </TactileButton>
                  )}

                  {booking.status === 'COMPLETED' && (
                    <TactileButton
                      variant="secondary"
                      onClick={() =>
                        void handleCompleteAndSendReviewLink(booking)
                      }
                      className="sm:flex-1"
                    >
                      <MessageCircle
                        className="h-4 w-4 text-[#2E7D5B]"
                        strokeWidth={1.5}
                      />
                      <span>Renvoyer le lien d’avis WhatsApp</span>
                    </TactileButton>
                  )}

                  {booking.status !== 'CANCELLED' &&
                    booking.status !== 'COMPLETED' && (
                      <TactileButton
                        variant="ghost"
                        isLoading={busyId === booking.id}
                        onClick={() => void handleCancelBooking(booking)}
                      >
                        <XCircle className="h-4 w-4" strokeWidth={1.5} />
                        <span>Annuler ce créneau</span>
                      </TactileButton>
                    )}
                </div>
              </article>
            ))
          )}
        </div>
      )}

      {/* =====================================================================
          ONGLET 2 : TARIFS & ACOMPTES (UNE SEULE GRILLE LIMPIDE, ZÉRO DOUBLE PROMO)
         ===================================================================== */}
      {activeTab === 'pricing' && (
        <div className="mt-6 space-y-6">
          <div className="rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery sm:p-7">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1C191A]">
                  Tarifs & Acomptes du Studio
                </h2>
                <p className="mt-1 text-xs text-[#786B6E]">
                  Modifiez directement le tarif total et l’acompte exigé pour chaque prestation. Les modifications s’appliquent immédiatement sur le site.
                </p>
              </div>

              <TactileButton
                variant="primary"
                className="self-start sm:self-auto min-h-10 px-5 py-2 text-xs"
                isLoading={isSavingAllServices}
                onClick={handleSaveAllServicesPricing}
              >
                <Sparkles className="h-4 w-4" />
                <span>Enregistrer les tarifs</span>
              </TactileButton>
            </div>

            {/* Bannière promo discrète optionnelle */}
            <div className="mt-5 flex items-center justify-between rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-4 text-xs">
              <div>
                <p className="font-semibold text-[#1C191A]">
                  Bannière Promo en haut du site vitrine
                </p>
                <p className="text-[11px] text-[#786B6E]">
                  Affiche ou masque un ruban spécial pour annoncer une réduction aux visiteuses.
                </p>
              </div>
              <button
                type="button"
                onClick={handleTogglePromoBanner}
                disabled={isTogglingPromo}
                className={cn(
                  'relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
                  promoModeActive ? 'bg-[#C47482]' : 'bg-[#E5DCDD]'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out',
                    promoModeActive ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </button>
            </div>

            {/* Liste directe des prestations */}
            <div className="mt-6 space-y-4">
              {servicesList.map((service) => {
                const edit = editingServices[service.id] ?? {
                  priceXof: service.priceXof,
                  depositXof: service.depositXof,
                };

                return (
                  <div
                    key={service.id}
                    className="flex flex-col justify-between gap-4 rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-4.5 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#F3E1E6] bg-white">
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-semibold text-[#1C191A]">
                          {service.name}
                        </h3>
                        <div className="mt-0.5 flex items-center gap-2">
                          <span className="text-[11px] text-[#786B6E]">
                            {service.category === 'FULL_SET'
                              ? 'Pose Complète'
                              : 'Remplissage'}
                          </span>
                          <span className="text-[11px] font-medium text-[#B36270]">
                            • {service.durationMinutes} min
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#786B6E]">
                          Prix Total (FCFA)
                        </label>
                        <input
                          type="number"
                          step={500}
                          min={1000}
                          value={edit.priceXof}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveAllServicesPricing();
                          }}
                          onChange={(e) =>
                            setEditingServices((prev) => ({
                              ...prev,
                              [service.id]: {
                                ...edit,
                                priceXof: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 w-32 rounded-lg border border-[#F3E1E6] bg-white px-3 py-1.5 text-xs font-semibold tabular-nums text-[#1C191A] focus:border-[#D88B99] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold uppercase tracking-wider text-[#B36270]">
                          Acompte Requis (FCFA)
                        </label>
                        <input
                          type="number"
                          step={500}
                          min={1000}
                          value={edit.depositXof}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveAllServicesPricing();
                          }}
                          onChange={(e) =>
                            setEditingServices((prev) => ({
                              ...prev,
                              [service.id]: {
                                ...edit,
                                depositXof: Number(e.target.value),
                              },
                            }))
                          }
                          className="mt-1 w-32 rounded-lg border border-[#D88B99] bg-white px-3 py-1.5 text-xs font-semibold tabular-nums text-[#1C191A] focus:border-[#B36270] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col items-center justify-between gap-3 rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-4 sm:flex-row">
              <div className="flex items-center gap-2 text-xs text-[#786B6E]">
                <ShieldCheck className="h-4 w-4 text-[#C47482]" />
                <span>L’acompte est exigé pour chaque réservation et déduit du total le jour de la séance.</span>
              </div>
              <TactileButton
                variant="primary"
                isLoading={isSavingAllServices}
                onClick={handleSaveAllServicesPricing}
                className="w-full sm:w-auto min-h-10 px-5 py-2 text-xs"
              >
                <Sparkles className="h-4 w-4" />
                <span>Enregistrer la grille tarifaire</span>
              </TactileButton>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          ONGLET 3 : PLANNING & STUDIO (PAUSE EXAMENS + BLOCAGE CRÉNEAUX + AVIS)
         ===================================================================== */}
      {activeTab === 'planning' && (
        <div className="mt-6 space-y-6">
          {/* Section 1 : Pause Temporaire du Studio (1 Clic) */}
          <section className="rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <PowderyBadge variant={examModeActive ? 'amber' : 'sage'}>
                  <GraduationCap className="h-3.5 w-3.5" strokeWidth={1.5} />
                  {examModeActive
                    ? 'Studio actuellement en Pause'
                    : 'Studio Ouvert aux Réservations'}
                </PowderyBadge>
                <h2 className="mt-2 font-serif text-2xl font-semibold text-[#1C191A]">
                  Pause Temporaire du Studio (Examens ou Congés)
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-[#786B6E]">
                  Suspendez immédiatement la prise de rendez-vous en ligne pendant vos périodes de révisions ou d’absence, sans toucher à vos réglages.
                </p>
              </div>
            </div>

            <TactileButton
              variant={examModeActive ? 'secondary' : 'primary'}
              isLoading={isSavingExamMode}
              onClick={() => void handleToggleExamMode(!examModeActive)}
            >
              <Clock className="h-4 w-4" strokeWidth={1.5} />
              <span>
                {examModeActive
                  ? 'Rouvrir les réservations du studio'
                  : 'Mettre le studio en pause maintenant'}
              </span>
            </TactileButton>
          </section>

          {/* Section 2 : Bloquer rapidement un créneau ou une journée */}
          <form
            onSubmit={handleQuickCloseSlot}
            className="rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery space-y-4"
          >
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#1C191A]">
                Bloquer un créneau ou une plage horaire
              </h2>
              <p className="mt-1 text-xs text-[#786B6E]">
                Un imprévu ou un cours déplacé ? Bloquez la plage horaire souhaitée pour la retirer du calendrier.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 tabular-nums">
              <div>
                <label
                  htmlFor="blockDate"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#1C191A]"
                >
                  Date *
                </label>
                <input
                  id="blockDate"
                  type="date"
                  required
                  value={blockDateKey}
                  onChange={(e) => setBlockDateKey(e.target.value)}
                  className="mt-1.5 min-h-12 w-full rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] px-4 py-2.5 text-base text-[#1C191A]"
                />
              </div>

              <div>
                <label
                  htmlFor="blockStart"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#1C191A]"
                >
                  Heure de début *
                </label>
                <input
                  id="blockStart"
                  type="time"
                  required
                  value={blockStartTime}
                  onChange={(e) => setBlockStartTime(e.target.value)}
                  className="mt-1.5 min-h-12 w-full rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] px-4 py-2.5 text-base text-[#1C191A]"
                />
              </div>

              <div>
                <label
                  htmlFor="blockEnd"
                  className="block text-xs font-semibold uppercase tracking-wider text-[#1C191A]"
                >
                  Heure de fin *
                </label>
                <input
                  id="blockEnd"
                  type="time"
                  required
                  value={blockEndTime}
                  onChange={(e) => setBlockEndTime(e.target.value)}
                  className="mt-1.5 min-h-12 w-full rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] px-4 py-2.5 text-base text-[#1C191A]"
                />
              </div>
            </div>

            <TactileButton type="submit" isLoading={isCreatingBlock}>
              <PlusCircle className="h-4 w-4" strokeWidth={1.5} />
              <span>Bloquer cette plage horaire</span>
            </TactileButton>
          </form>

          {/* Section 3 : Liste des créneaux bloqués et réouverture */}
          <section className="rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery space-y-4">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#1C191A]">
                Créneaux actuellement bloqués ({blackoutPeriods.length})
              </h2>
              <p className="mt-1 text-xs text-[#786B6E]">
                Ces plages horaires sont masquées aux clientes. Vous pouvez les rouvrir à tout moment d&apos;un simple clic.
              </p>
            </div>

            {blackoutPeriods.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#F3E1E6] bg-[#FDF8F9] p-6 text-center text-xs text-[#786B6E]">
                Aucun créneau bloqué manuellement. Votre calendrier est accessible selon les horaires habituels.
              </div>
            ) : (
              <div className="space-y-3">
                {blackoutPeriods.map((b) => {
                  const startDate = b.startAtIso.slice(0, 10);
                  const startTime = b.startAtIso.slice(11, 16);
                  const endTime = b.endAtIso.slice(11, 16);
                  return (
                    <div
                      key={b.id}
                      className="flex flex-col gap-3 rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <PowderyBadge variant="rose">
                            Indisponible
                          </PowderyBadge>
                          <span className="font-serif text-base font-semibold text-[#1C191A]">
                            {formatDakarDateLong(startDate)}
                          </span>
                        </div>
                        <p className="text-xs text-[#786B6E]">
                          Plage fermée : <strong className="text-[#1C191A]">{startTime} – {endTime}</strong>
                        </p>
                      </div>

                      <TactileButton
                        variant="secondary"
                        isLoading={deletingBlockId === b.id}
                        onClick={() => void handleDeleteBlackoutPeriod(b.id)}
                        className="text-xs px-3 py-2"
                      >
                        <XCircle className="h-4 w-4 text-[#D88B99]" strokeWidth={1.5} />
                        <span>Rouvrir ce créneau</span>
                      </TactileButton>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 4 : Modération des Avis Clientes */}
          <section className="rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1C191A]">
                  Avis Clientes ({reviews.length})
                </h2>
                <p className="mt-1 text-xs text-[#786B6E]">
                  Témoignages déposés via le lien WhatsApp personnel envoyé après chaque séance terminée.
                </p>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#F3E1E6] bg-[#FDF8F9] p-6 text-center text-xs text-[#786B6E]">
                Aucun avis pour le moment. Ils apparaîtront ici dès que vos clientes auront répondu au lien d’évaluation.
              </div>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <article
                    key={rev.id}
                    className="rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] p-4.5 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-[#1C191A]">
                          {rev.publicDisplayName ?? 'Cliente'}
                        </span>
                        <span className="text-xs text-[#786B6E]">
                          • {rev.serviceNameSnap}
                        </span>
                      </div>

                      <PowderyBadge
                        variant={
                          rev.moderationStatus === 'APPROVED'
                            ? 'sage'
                            : rev.moderationStatus === 'REJECTED'
                              ? 'neutral'
                              : 'amber'
                        }
                      >
                        {rev.moderationStatus === 'APPROVED'
                          ? 'Publié sur le site'
                          : rev.moderationStatus === 'REJECTED'
                            ? 'Masqué'
                            : 'En attente'}
                      </PowderyBadge>
                    </div>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={
                            idx < (rev.rating ?? 5)
                              ? 'h-4 w-4 fill-[#D88B99] text-[#D88B99]'
                              : 'h-4 w-4 text-[#F3E1E6]'
                          }
                          strokeWidth={1.5}
                        />
                      ))}
                    </div>

                    <p className="text-xs leading-relaxed text-[#1C191A]">
                      « {rev.comment} »
                    </p>

                    <div className="flex flex-wrap gap-2 border-t border-[#F3E1E6] pt-2.5">
                      {rev.moderationStatus !== 'APPROVED' && (
                        <TactileButton
                          variant="primary"
                          className="text-xs px-3 py-1.5 min-h-9"
                          isLoading={busyId === rev.id}
                          onClick={() => void handleModerateReview(rev.id, 'APPROVED')}
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          <span>Publier</span>
                        </TactileButton>
                      )}

                      {rev.moderationStatus !== 'REJECTED' && (
                        <TactileButton
                          variant="secondary"
                          className="text-xs px-3 py-1.5 min-h-9"
                          isLoading={busyId === rev.id}
                          onClick={() => void handleModerateReview(rev.id, 'REJECTED')}
                        >
                          <XCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                          <span>Masquer</span>
                        </TactileButton>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
