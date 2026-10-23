import React from 'react';
import Link from 'next/link';
import { Calendar, Clock } from 'lucide-react';
import {
  WhatsAppIcon,
  InstagramIcon,
  TikTokIcon,
  SnapchatIcon,
} from '@/components/ui/SocialIcons';
import { loadContactSettings } from '@/lib/catalog-fallback';
import { buildGeneralContactWhatsAppUrl } from '@/lib/whatsapp';

export const revalidate = 60;

export default async function ContactPage() {
  const settings = await loadContactSettings();
  const whatsappUrl = buildGeneralContactWhatsAppUrl(settings.whatsappPhone);
  const cleanInsta = settings.instagramHandle.replace(/^@/, '');
  const instagramUrl = `https://instagram.com/${cleanInsta}`;
  const tiktokUrl = 'https://www.tiktok.com/@diamassa4';
  const snapchatUrl = 'https://snapchat.com/t/xA2BNkFr';

  return (
    <div className="bg-white py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B36270]">
            Une question particulière ?
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-[#1C191A] sm:text-4xl">
            Contacter DIAMA EYELASH EXTENSIONS
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-[#786B6E]">
            Pour réserver un créneau, utilisez directement le calendrier en ligne
            (plus rapide et disponible 24h/24). Pour toute question
            spécifique, écrivez-moi sur WhatsApp ou retrouvez le studio sur nos réseaux.
          </p>
        </div>

        {/* Grille des 4 canaux officiels */}
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* WHATSAPP DIRECT */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-lift flex flex-col justify-between rounded-[24px] border border-[#25D366]/25 bg-[#F4FBF7] p-6 shadow-powdery transition-all duration-150 ease-emil-out hover:border-[#25D366]/50 active:scale-[0.98]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-md shadow-[#25D366]/20">
                  <WhatsAppIcon className="h-6 w-6 fill-current" />
                </span>
                <span className="rounded-full bg-[#25D366]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#1A9E4B]">
                  Réponse rapide
                </span>
              </div>
              <h2 className="mt-4 font-serif text-2xl font-semibold text-[#1C191A]">
                WhatsApp Direct
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#55695D]">
                Idéal pour une question sur un remplissage, un doute sur le choix de pose ou une demande d&apos;acompte.
              </p>
            </div>
            <p className="mt-5 text-xs font-bold text-[#1A9E4B] tabular-nums">
              Discuter sur WhatsApp ({settings.whatsappPhone}) →
            </p>
          </a>

          {/* INSTAGRAM */}
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-lift flex flex-col justify-between rounded-[24px] border border-[#F3E1E6] bg-[#FDF8F9] p-6 shadow-powdery transition-all duration-150 ease-emil-out hover:border-[#D88B99]/50 active:scale-[0.98]"
          >
            <div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] text-white shadow-sm">
                <InstagramIcon className="h-6 w-6 fill-current" />
              </span>
              <h2 className="mt-4 font-serif text-2xl font-semibold text-[#1C191A]">
                Instagram
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#786B6E]">
                Découvrez la galerie de photos réelles des poses, nos actualités et les retours clientes.
              </p>
            </div>
            <p className="mt-5 text-xs font-semibold text-[#B36270]">
              Voir {settings.instagramHandle} →
            </p>
          </a>

          {/* TIKTOK */}
          <a
            href={tiktokUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-lift flex flex-col justify-between rounded-[24px] border border-[#E5E0E2] bg-white p-6 shadow-powdery transition-all duration-150 ease-emil-out hover:border-[#1C191A] active:scale-[0.98]"
          >
            <div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#010101] text-white shadow-sm">
                <TikTokIcon className="h-6 w-6 fill-current" />
              </span>
              <h2 className="mt-4 font-serif text-2xl font-semibold text-[#1C191A]">
                TikTok
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#786B6E]">
                Vidéos en gros plan du travail cil à cil, conseils d&apos;entretien et transformations du regard.
              </p>
            </div>
            <p className="mt-5 text-xs font-semibold text-[#1C191A]">
              Voir les vidéos sur TikTok →
            </p>
          </a>

          {/* SNAPCHAT */}
          <a
            href={snapchatUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hover-lift flex flex-col justify-between rounded-[24px] border border-[#FDF0A6] bg-[#FFFEF4] p-6 shadow-powdery transition-all duration-150 ease-emil-out hover:border-[#FFFC00] active:scale-[0.98]"
          >
            <div>
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFFC00] text-black shadow-sm">
                <SnapchatIcon className="h-6 w-6 fill-current" />
              </span>
              <h2 className="mt-4 font-serif text-2xl font-semibold text-[#1C191A]">
                Snapchat
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-[#786B6E]">
                Stories quotidiennes du studio, coulisses et créneaux libérés en direct de dernière minute.
              </p>
            </div>
            <p className="mt-5 text-xs font-bold text-[#A38600]">
              Ajouter sur Snapchat →
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

