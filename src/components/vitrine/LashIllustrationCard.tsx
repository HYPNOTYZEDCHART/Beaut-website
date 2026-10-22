import React from 'react';
import { Sparkles } from 'lucide-react';
import { LashLogoMark } from '@/components/ui/LashLogoMark';

interface LashIllustrationCardProps {
  title?: string;
  subtitle?: string;
  badgeText?: string;
  backgroundImageUrl?: string;
}

export function LashIllustrationCard({
  title = 'L’art du regard sur-mesure',
  subtitle = 'Courbures soyeuses • Pose cil par cil isolé • Confort absolu',
  badgeText = 'Studio Privé • Dakar',
  backgroundImageUrl = '/images/hero-studio-bg.jpg',
}: LashIllustrationCardProps) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#F3E1E6] bg-gradient-to-b from-[#FDF8F9] via-white to-[#F9EBEF]/70 p-6 shadow-powderyLg sm:p-8">
      {/* Photo d'arrière-plan subtilement voilée derrière l'écrin */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <img
          src={backgroundImageUrl}
          alt=""
          loading="eager"
          className="h-full w-full object-cover object-center opacity-25 scale-105 transition-transform duration-700 ease-emil-out"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FDF8F9]/85 via-white/80 to-[#F9EBEF]/85" />
      </div>

      <div className="relative z-10 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#F3E1E6] bg-white/95 px-3 py-1 text-xs font-medium text-[#B36270] shadow-powdery">
          <Sparkles className="h-3.5 w-3.5 text-[#D88B99]" strokeWidth={1.5} />
          {badgeText}
        </span>
        <span className="text-xs font-medium tracking-widest uppercase text-[#786B6E]">
          Haute Couture
        </span>
      </div>

      {/* Emblème officiel de courbure de cils conservé intact au centre de son écrin */}
      <div className="relative z-10 my-7 flex flex-col items-center justify-center rounded-2xl border border-[#F3E1E6]/90 bg-white/92 px-6 py-9 shadow-powdery backdrop-blur-[2px]">
        <LashLogoMark size="lg" />

        <p className="mt-4 font-serif text-xl font-semibold text-[#1C191A] text-center">
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
        <div>
          <p className="font-serif text-lg font-semibold text-[#1C191A]">Wave / OM</p>
          <p className="text-[11px] text-[#786B6E]">Acompte sécurisé</p>
        </div>
      </div>
    </div>
  );
}
