import React from 'react';

export default function RootLoading() {
  return (
    <div className="min-h-[80dvh] bg-[#FDF8F9]/60 px-4 py-12 animate-in fade-in duration-150">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Ligne d'en-tête */}
        <div className="space-y-3">
          <div className="h-6 w-32 rounded-full bg-[#F3E1E6]/70 animate-pulse" />
          <div className="h-10 w-72 max-w-full rounded-2xl bg-gradient-to-r from-[#F3E1E6] via-[#FAF7F5] to-[#F3E1E6] animate-pulse" />
          <div className="h-4 w-96 max-w-full rounded-lg bg-[#F3E1E6]/50 animate-pulse" />
        </div>

        {/* Bloc central élégant */}
        <div className="mt-8 rounded-[28px] border border-[#F3E1E6] bg-white p-6 shadow-powdery sm:p-8">
          <div className="h-48 w-full rounded-2xl bg-[#FAF7F5] animate-pulse sm:h-64" />
          <div className="mt-6 space-y-3">
            <div className="h-5 w-1/3 rounded-lg bg-[#F3E1E6]/80 animate-pulse" />
            <div className="h-4 w-2/3 rounded-md bg-[#F3E1E6]/50 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
