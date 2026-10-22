import React from 'react';
import Link from 'next/link';
import { Calendar, Info } from 'lucide-react';
import { loadVitrineData } from '@/lib/catalog-fallback';
import { PrestationsClientList } from '@/components/vitrine/PrestationsClientList';

export const dynamic = 'force-dynamic';

export default async function PrestationsPage() {
  const { services } = await loadVitrineData();

  return (
    <div className="bg-[#FDF8F9] py-10 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B36270]">
            Prestations & Tarifs en FCFA
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-[#1C191A] sm:text-4xl">
            Nos modèles d’extensions de cils
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#786B6E] sm:text-base">
            Chaque pose inclut un diagnostic personnalisé de la courbure et de la
            longueur adaptées à vos yeux, ainsi qu’un temps dédié au nettoyage et
            à la préparation du matériel entre chaque cliente.
          </p>
        </div>

        <div className="mt-8">
          <PrestationsClientList services={services} />
        </div>

        {/* Encadré de rappel sur les remplissages & règles */}
        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Info
              className="mt-0.5 h-5 w-5 shrink-0 text-[#D88B99]"
              strokeWidth={1.5}
            />
            <div>
              <h2 className="font-serif text-xl font-semibold text-[#1C191A]">
                Première visite chez DIAMA EYELASH EXTENSIONS ?
              </h2>
              <p className="mt-1 text-sm text-[#786B6E]">
                Consultez les consignes de préparation des cils et notre politique
                d’acompte avant de réserver votre créneau.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Link
              href="/a-savoir"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#F3E1E6] bg-[#FDF8F9] px-5 py-2.5 text-xs font-medium text-[#1C191A] transition-transform duration-150 ease-emil-out active:scale-[0.98]"
            >
              À savoir avant de venir
            </Link>
            <Link
              href="/reserver"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C47482] px-6 py-2.5 text-xs font-medium text-white shadow-powdery transition-transform duration-150 ease-emil-out active:scale-[0.98] hover:bg-[#B36270]"
            >
              <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
              <span>Réserver maintenant</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

