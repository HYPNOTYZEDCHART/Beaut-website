'use client';

import React from 'react';
import Link from 'next/link';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import { TactileButton } from '@/components/ui/TactileButton';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <div className="flex min-h-[78dvh] items-center justify-center bg-[#FDF8F9] px-4 py-12">
      <div className="mx-auto max-w-md rounded-[28px] border border-[#F3E1E6] bg-white p-8 text-center shadow-powderyLg space-y-5">
        <h1 className="font-serif text-3xl font-semibold text-[#1C191A]">
          Un léger contretemps est survenu
        </h1>
        <p className="text-sm leading-relaxed text-[#786B6E]">
          {error.message ||
            'Impossible d’afficher cette section pour le moment. Vous pouvez réessayer en un clic.'}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <TactileButton variant="primary" onClick={() => reset()}>
            <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
            <span>Réessayer</span>
          </TactileButton>

          <Link
            href="/#accueil"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#F3E1E6] bg-[#FDF8F9] px-5 py-3 text-xs font-medium text-[#1C191A] transition-transform duration-150 ease-emil-out active:scale-[0.97]"
          >
            <ArrowLeft className="h-4 w-4 text-[#D88B99]" strokeWidth={1.5} />
            <span>Retour à l’accueil</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

