import React from 'react';
import Link from 'next/link';
import { MessageCircle, Instagram, Calendar, Clock } from 'lucide-react';
import { loadContactSettings } from '@/lib/catalog-fallback';
import { buildGeneralContactWhatsAppUrl } from '@/lib/whatsapp';

export const revalidate = 60;

export default async function ContactPage() {
  const settings = await loadContactSettings();
  const whatsappUrl = buildGeneralContactWhatsAppUrl(settings.whatsappPhone);
  const cleanInsta = settings.instagramHandle.replace(/^@/, '');
  const instagramUrl = `https://instagram.com/${cleanInsta}`;

  return (
    <div className="bg-white py-10 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B36270]">
            Une question particulière ?
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-[#1C191A] sm:text-4xl">
            Contacter DIAMA EYELASH EXTENSIONS
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-[#786B6E]">
            Pour réserver un créneau, utilisez directement le calendrier en ligne
            (plus rapide, même lorsque je suis en cours). Pour toute question
            spécifique hors réservation, écrivez-moi sur WhatsApp ou Instagram.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-lift flex flex-col justify-between rounded-[24px] border border-[#F3E1E6] bg-[#FDF8F9] p-6 shadow-powdery transition-transform duration-150 ease-emil-out active:scale-[0.98]"
          >
            <div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#EBF5F0] text-[#2E7D5B]">
                <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h2 className="mt-4 font-serif text-2xl font-semibold text-[#1C191A]">
                WhatsApp Direct
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#786B6E]">
                Idéal pour une question sur un remplissage ou un doute avant de
                choisir votre pose.
              </p>
            </div>
            <p className="mt-5 text-xs font-semibold text-[#2E7D5B] tabular-nums">
              Écrire sur WhatsApp ({settings.whatsappPhone}) →
            </p>
          </a>

          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-lift flex flex-col justify-between rounded-[24px] border border-[#F3E1E6] bg-[#FDF8F9] p-6 shadow-powdery transition-transform duration-150 ease-emil-out active:scale-[0.98]"
          >
            <div>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#F9EBEF] text-[#B36270]">
                <Instagram className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h2 className="mt-4 font-serif text-2xl font-semibold text-[#1C191A]">
                Instagram
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#786B6E]">
                Découvrez les photos et vidéos des poses réalisées au studio.
              </p>
            </div>
            <p className="mt-5 text-xs font-semibold text-[#B36270]">
              Voir {settings.instagramHandle} →
            </p>
          </a>
        </div>

        {/* Rappel des horaires d'ouverture */}
        <div className="mt-6 rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1C191A]">
            <Clock className="h-4 w-4 text-[#D88B99]" strokeWidth={1.5} />
            <span>Créneaux habituels d’ouverture (hors périodes d’examens)</span>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 text-xs text-[#786B6E] tabular-nums sm:grid-cols-3">
            <div className="rounded-xl border border-[#F3E1E6] bg-[#FDF8F9] px-3.5 py-2.5">
              <p className="font-semibold text-[#1C191A]">Mercredi</p>
              <p>14:30 – 19:30</p>
            </div>
            <div className="rounded-xl border border-[#F3E1E6] bg-[#FDF8F9] px-3.5 py-2.5">
              <p className="font-semibold text-[#1C191A]">Vendredi</p>
              <p>14:30 – 19:30</p>
            </div>
            <div className="rounded-xl border border-[#F3E1E6] bg-[#FDF8F9] px-3.5 py-2.5">
              <p className="font-semibold text-[#1C191A]">Samedi</p>
              <p>09:30 – 18:30</p>
            </div>
          </div>

          <div className="mt-5 border-t border-[#F3E1E6] pt-4 text-center">
            <Link
              href="/reserver"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C47482] px-7 py-3 text-xs font-medium text-white shadow-powdery transition-transform duration-150 ease-emil-out active:scale-[0.98] hover:bg-[#B36270]"
            >
              <Calendar className="h-4 w-4" strokeWidth={1.5} />
              <span>Accéder au calendrier de réservation</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

