'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/cn';

interface ShimmerBookingButtonProps {
  href?: string;
  label?: string;
  sublabel?: string;
  className?: string;
  fullWidth?: boolean;
}

export function ShimmerBookingButton({
  href = '/reserver',
  label = 'Réserver mon rendez-vous',
  sublabel,
  className,
  fullWidth = false,
}: ShimmerBookingButtonProps) {
  const router = useRouter();

  return (
    <motion.button
      type="button"
      onClick={() => router.push(href)}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={cn(
        'group relative inline-flex min-h-12 items-center justify-center gap-3 overflow-hidden rounded-full border border-[#B36270]/30 bg-[#C47482] px-7 py-3.5 text-sm font-semibold tracking-wide text-white',
        'shadow-powderyLg hover:bg-[#B36270]',
        fullWidth && 'w-full',
        className
      )}
    >
      {/* Voile nacré poudré subtil (zéro néon) */}
      <span
        aria-hidden="true"
        className="shimmer-sheen pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[#FDF8F9]/25 to-transparent"
      />

      <Calendar className="relative z-10 h-4 w-4 shrink-0" strokeWidth={1.75} />
      <span className="relative z-10 flex flex-col items-start text-left leading-tight">
        <span>{label}</span>
        {sublabel && (
          <span className="text-[11px] font-normal text-[#FDF8F9]/90 tabular-nums">
            {sublabel}
          </span>
        )}
      </span>
      <ArrowRight
        className="relative z-10 h-4 w-4 shrink-0 transition-transform duration-200 ease-emil-out group-hover:translate-x-1"
        strokeWidth={1.75}
      />
    </motion.button>
  );
}

interface StickyAndroidBookingBarProps {
  selectedServiceName?: string;
  selectedServiceSlug?: string;
  selectedServicePriceFormatted?: string;
}

export function StickyAndroidBookingBar({
  selectedServiceName,
  selectedServiceSlug,
  selectedServicePriceFormatted,
}: StickyAndroidBookingBarProps) {
  const href = selectedServiceSlug
    ? `/reserver?service=${encodeURIComponent(selectedServiceSlug)}`
    : '/reserver';

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#F3E1E6] bg-white/95 px-4 pt-2.5 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-powderyLg backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-[#B36270]">
            <Sparkles className="h-3 w-3 text-[#D88B99]" strokeWidth={1.5} />
            <span className="truncate">
              {selectedServiceName ?? 'Créneaux ouverts'}
            </span>
          </p>
          <p className="truncate text-xs font-medium text-[#1C191A] tabular-nums">
            {selectedServicePriceFormatted
              ? `${selectedServicePriceFormatted} • Sans attente`
              : 'Réservation autonome 24h/24'}
          </p>
        </div>

        <ShimmerBookingButton
          href={href}
          label="Réserver"
          className="shrink-0 px-5 py-3 text-xs"
        />
      </div>
    </div>
  );
}

