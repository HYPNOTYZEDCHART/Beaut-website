import React from 'react';
import Link from 'next/link';
import { Calendar, ArrowLeft, Sparkles } from 'lucide-react';
import { PowderyBadge } from '@/components/ui/PowderyBadge';

export default function NotFound() {
  return (
    <div className="flex min-h-[78dvh] items-center justify-center bg-[#FDF8F9] px-4 py-12">
      <div className="mx-auto max-w-md rounded-[28px] border border-[#F3E1E6] bg-white p-8 text-center shadow-powderyLg">
        <PowderyBadge variant="rose">
          <Sparkles className="h-3.5 w-3.5 text-[#D88B99]" strokeWidth={1.5} />
          Page introuvable
        </PowderyBadge>

        <h1 className="mt-4 font-serif text-3xl font-semibold text-[#1C191A]">
          Cette page n’existe pas
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[#786B6E]">
          Retrouvez toutes nos poses d’extensions de cils, les informations du
          studio et les avis clientes sur la page d’accueil, ou réservez
          directement votre créneau.
        </p>

        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/#accueil"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#F3E1E6] bg-[#FDF8F9] px-5 py-3 text-xs font-medium text-[#1C191A] transition-transform duration-150 ease-emil-out active:scale-[0.97]"
          >
            <ArrowLeft className="h-4 w-4 text-[#D88B99]" strokeWidth={1.5} />
            <span>Retour à l’accueil</span>
          </Link>

          <Link
            href="/reserver"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C47482] px-6 py-3 text-xs font-semibold text-white shadow-powdery transition-transform duration-150 ease-emil-out active:scale-[0.97] hover:bg-[#B36270]"
          >
            <Calendar className="h-4 w-4" strokeWidth={1.5} />
            <span>Réserver mon créneau</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

