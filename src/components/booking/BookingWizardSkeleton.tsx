import React from 'react';

export function BookingWizardSkeleton() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-10 animate-in fade-in duration-200">
      {/* 1. En-tête : Badges & Titre */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#F3E1E6] bg-white/80 px-3 py-1 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-[#D88B99] animate-ping" />
          <div className="h-3.5 w-36 rounded-full bg-[#F3E1E6]/70" />
        </div>
        <div className="h-8 w-64 max-w-full rounded-2xl bg-gradient-to-r from-[#F3E1E6] via-[#FAF7F5] to-[#F3E1E6] animate-pulse sm:h-10 sm:w-80" />
        <div className="h-4 w-80 max-w-full rounded-lg bg-[#F3E1E6]/60 animate-pulse" />
      </div>

      {/* 2. Stepper des 4 étapes */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none sm:gap-3">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className="flex shrink-0 items-center gap-2 rounded-full border border-[#F3E1E6] bg-white px-3.5 py-1.5 shadow-sm"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F3E1E6] text-[10px] font-semibold text-[#B36270]">
              {step}
            </div>
            <div className="h-3 w-16 rounded bg-[#F3E1E6]/60 sm:w-20" />
          </div>
        ))}
      </div>

      {/* 3. Grille des prestations (Étape 1) */}
      <div className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-5 w-44 rounded-lg bg-[#F3E1E6]/80 animate-pulse" />
          <div className="h-4 w-28 rounded-md bg-[#F3E1E6]/50 animate-pulse hidden sm:block" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-[24px] border border-[#F3E1E6] bg-white p-5 shadow-powdery"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-20 rounded bg-[#F9EBEF]" />
                  <div className="h-5 w-36 rounded-lg bg-[#F3E1E6]/80 animate-pulse" />
                </div>
                <div className="h-7 w-20 rounded-full bg-[#F9EBEF] border border-[#F3E1E6]" />
              </div>

              <div className="mt-3 space-y-1.5">
                <div className="h-3.5 w-full rounded bg-[#FAF7F5]" />
                <div className="h-3.5 w-4/5 rounded bg-[#FAF7F5]" />
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#F3E1E6]/60 pt-3">
                <div className="h-3 w-24 rounded bg-[#F3E1E6]/50" />
                <div className="h-8 w-24 rounded-full bg-[#F9EBEF] border border-[#F3E1E6]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
