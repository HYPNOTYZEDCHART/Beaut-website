import React from 'react';
import Link from 'next/link';
import { LashLogoMark } from '@/components/ui/LashLogoMark';

export function Footer() {
  return (
    <footer className="safe-bottom border-t border-[#F3E1E6] bg-[#FDF8F9] pt-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-4 text-center sm:flex-row sm:px-6 sm:text-left">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3.5">
          <span className="inline-flex h-11 w-14 items-center justify-center rounded-2xl border border-[#F3E1E6] bg-white px-2 shadow-powdery">
            <LashLogoMark size="md" />
          </span>
          <div>
            <p className="font-serif text-lg font-semibold tracking-wider text-[#1C191A]">
              TON ESPACE BEAUTÉ
            </p>
            <p className="mt-0.5 text-xs text-[#786B6E]">
              Extensions de cils sur-mesure à Dakar • Sur rendez-vous uniquement.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-[#786B6E]">
          <Link href="/prestations" className="hover:text-[#1C191A]">
            Tarifs & Poses
          </Link>
          <Link href="/a-savoir" className="hover:text-[#1C191A]">
            À savoir avant de venir
          </Link>
          <Link href="/avis" className="hover:text-[#1C191A]">
            Avis clientes
          </Link>
          <Link href="/contact" className="hover:text-[#1C191A]">
            Contact
          </Link>
          <Link href="/admin" className="text-[#D88B99] hover:text-[#B36270]">
            Espace Praticienne
          </Link>
        </div>
      </div>
    </footer>
  );
}

