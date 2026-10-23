import React from 'react';
import { Sparkles } from 'lucide-react';
import { WaveAndOmBadge } from '@/components/ui/PaymentLogos';

interface LashIllustrationCardProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  backgroundImageUrl?: string;
  variant?: 'hero' | 'compact';
  className?: string;
}

export function LashIllustrationCard({
  title = 'L’art du regard sur-mesure',
  subtitle = 'Courbures soyeuses • Pose cil par cil isolé • Confort absolu',
  badgeText = 'Studio Privé • Dakar',
  backgroundImageUrl = '/images/hero-studio-bg.jpg',
  variant = 'hero',
  className = '',
}: LashIllustrationCardProps) {
  // 1. VERSION MOBILE COMPACTE (Écrin Signature allégé — Zéro effet bouchon)
  if (variant === 'compact') {
    return (
      <div
        className={`relative overflow-hidden rounded-[24px] border border-[#F3E1E6] bg-gradient-to-b from-[#FDF8F9] via-white to-[#F9EBEF]/70 p-4 shadow-powdery ${className}`}
      >
        {/* Photo d'arrière-plan subtilement voilée derrière l'écrin */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <img
            src={backgroundImageUrl}
            alt=""
            loading="eager"
            className="h-full w-full object-cover object-center opacity-30 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FDF8F9]/85 via-white/80 to-[#F9EBEF]/85" />
        </div>

        {/* Ligne d'en-tête : Badges discrets */}
        <div className="relative z-10 flex items-center justify-between pb-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F3E1E6] bg-white/95 px-2.5 py-0.5 text-[11px] font-medium text-[#B36270] shadow-sm">
            <Sparkles className="h-3 w-3 text-[#D88B99]" strokeWidth={1.5} />
            {badgeText}
          </span>
          <span className="text-[10px] font-semibold tracking-widest uppercase text-[#786B6E]">
            Studio Privé
          </span>
        </div>

        {/* Cœur de l'écrin : Logo en médaillon + Titre & Sous-titre */}
        <div className="relative z-10 flex items-center gap-3.5 rounded-2xl border border-[#F3E1E6]/90 bg-white/90 p-3 shadow-sm backdrop-blur-[2px]">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-[#F3E1E6] bg-[#FDF8F9] p-1 shadow-sm">
            <img
              src="/images/diama-logo.jpg"
              alt="Diama Eyelash Extensions Logo Officiel"
              className="h-full w-full object-contain"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-serif text-base font-semibold leading-snug text-[#1C191A] truncate">
              {title}
            </p>
            <p className="mt-0.5 text-[11px] leading-tight text-[#786B6E]">
              {subtitle}
            </p>
          </div>
        </div>

        {/* 3 Piliers d'excellence condensés */}
        <div className="relative z-10 mt-3 grid grid-cols-3 gap-1.5 border-t border-[#F3E1E6] pt-2.5 text-center tabular-nums">
          <div>
            <p className="font-serif text-sm font-semibold text-[#1C191A]">100%</p>
            <p className="text-[10px] text-[#786B6E]">Isolation cil à cil</p>
          </div>
          <div className="border-x border-[#F3E1E6]">
            <p className="font-serif text-sm font-semibold text-[#1C191A]">24–48h</p>
            <p className="text-[10px] text-[#786B6E]">À l’avance</p>
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="flex h-5 items-center justify-center">
              <WaveAndOmBadge size="sm" />
            </div>
            <p className="mt-0.5 text-[10px] font-medium text-[#786B6E]">Acompte sécurisé</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. VERSION DESKTOP HERO (Écrin étendu)
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-[#F3E1E6] bg-gradient-to-b from-[#FDF8F9] via-white to-[#F9EBEF]/70 p-6 shadow-powderyLg sm:p-8 ${className}`}
    >
      {/* Photo d'arrière-plan subtilement voilée derrière l'écrin */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <img
          src={backgroundImageUrl}
          alt=""
          loading="eager"
          className="h-full w-full object-cover object-center opacity-40 scale-105 transition-transform duration-700 ease-emil-out"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDF8F9]/75 via-white/70 to-[#F9EBEF]/75" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F3E1E6] bg-white/95 px-3 py-1 text-xs font-medium text-[#B36270] shadow-powdery">
          <Sparkles className="h-3.5 w-3.5 text-[#D88B99]" strokeWidth={1.5} />
          {badgeText}
        </span>
        <span className="text-xs font-medium tracking-widest uppercase text-[#786B6E]">
          Studio Privé
        </span>
      </div>

      {/* Logo officiel Diama Eyelash Extensions au centre de son écrin */}
      <div className="relative z-10 my-6 flex flex-col items-center justify-center rounded-2xl border border-[#F3E1E6]/90 bg-white/95 p-6 shadow-powdery backdrop-blur-[2px]">
        <div className="relative h-44 w-44 overflow-hidden rounded-2xl">
          <img
            src="/images/diama-logo.jpg"
            alt="Diama Eyelash Extensions Logo Officiel"
            className="h-full w-full object-contain"
          />
        </div>

        <p className="mt-3 font-serif text-xl font-semibold text-[#1C191A] text-center">
          {title}
        </p>
        <p className="mt-1 text-xs text-[#786B6E] text-center">{subtitle}</p>
      </div>

      <div className="relative z-10 grid grid-cols-3 gap-2 border-t border-[#F3E1E6] pt-4 text-center tabular-nums">
        <div>
          <p className="font-serif text-lg font-semibold text-[#1C191A]">100%</p>
          <p className="text-[11px] text-[#786B6E]">Isolation cil à cil</p>
        </div>
        <div className="border-x border-[#F3E1E6]">
          <p className="font-serif text-lg font-semibold text-[#1C191A]">24–48h</p>
          <p className="text-[11px] text-[#786B6E]">Réservation à l’avance</p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-7 items-center justify-center">
            <WaveAndOmBadge size="md" />
          </div>
          <p className="mt-0.5 text-[11px] font-medium text-[#786B6E]">Acompte sécurisé</p>
        </div>
      </div>
    </div>
  );
}
