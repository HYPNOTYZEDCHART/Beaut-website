import React from 'react';
import Link from 'next/link';
import {
  Heart,
  Phone,
} from 'lucide-react';
import {
  WhatsAppIcon,
  InstagramIcon,
  TikTokIcon,
  SnapchatIcon,
} from '@/components/ui/SocialIcons';
import { loadContactSettings } from '@/lib/catalog-fallback';
import { buildGeneralContactWhatsAppUrl } from '@/lib/whatsapp';

export async function Footer() {
  const settings = await loadContactSettings();
  const whatsappUrl = buildGeneralContactWhatsAppUrl(settings.whatsappPhone);
  const cleanInsta = settings.instagramHandle.replace(/^@/, '');
  const instagramUrl = `https://instagram.com/${cleanInsta}`;

  const tiktokUrl = 'https://www.tiktok.com/@diamassa4';
  const snapchatUrl = 'https://snapchat.com/t/xA2BNkFr';

  return (
    <footer className="safe-bottom relative border-t border-[#2A2426] bg-[#141213] text-[#EDE4E6]">
      {/* SECTION MARQUE & RÉSEAUX OFFICIELS */}
      <div className="mx-auto max-w-6xl px-4 pt-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          {/* Marque & Description */}
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-[#3E3236] bg-[#231C1F] p-1.5 shadow-sm">
                <img
                  src="/images/diama-logo.jpg"
                  alt="Logo officiel Diama Eyelash Extensions"
                  className="h-full w-full object-contain"
                />
              </span>
              <div>
                <p className="font-serif text-lg font-bold tracking-wider text-white">
                  DIAMA EYELASH
                </p>
                <p className="text-xs uppercase tracking-widest text-[#D88B99]">
                  Extensions • Dakar
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[#B0A1A5]">
              Studio privé dédié à l’art des extensions de cils sur-mesure à Dakar. Chaque regard est sculpté
              avec patience, rigueur et isolation cil à cil pour sublimer votre beauté naturelle en toute sécurité.
            </p>
          </div>

          {/* Boutons Sociaux Officiels */}
          <div className="space-y-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#D88B99]">
              Rejoignez le studio sur les réseaux
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* VRAI BOUTON WHATSAPP */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp officiel Diama Eyelash"
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#25D366] px-3.5 text-xs font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#20BD5A] hover:shadow-[0_4px_14px_rgba(37,211,102,0.35)] active:scale-95"
              >
                <WhatsAppIcon className="h-4 w-4 fill-current" />
                <span>WhatsApp</span>
              </a>

              {/* INSTAGRAM */}
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Diama Eyelash Extensions"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#382E32] bg-[#1E181B] text-[#E5A5B1] transition-all duration-150 hover:border-[#E5A5B1] hover:bg-[#E5A5B1]/10 hover:text-white active:scale-95"
                title="Instagram @diamassa_"
              >
                <InstagramIcon className="h-5 w-5 fill-current" />
              </a>

              {/* TIKTOK */}
              <a
                href={tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok Diama Eyelash Extensions"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#382E32] bg-[#1E181B] text-white transition-all duration-150 hover:border-white hover:bg-white/10 active:scale-95"
                title="TikTok @diamassa4"
              >
                <TikTokIcon className="h-5 w-5 fill-current" />
              </a>

              {/* SNAPCHAT */}
              <a
                href={snapchatUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Snapchat Diama Eyelash Extensions"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFFC00] shadow-sm transition-all duration-150 hover:bg-[#FFE600] hover:shadow-[0_4px_14px_rgba(255,252,0,0.35)] active:scale-95"
                title="Snapchat officiel Diama Eyelash"
              >
                <SnapchatIcon className="h-5 w-5" />
              </a>

              {/* TÉLÉPHONE */}
              <a
                href="tel:+221776852146"
                aria-label="Appeler le studio Diama Eyelash"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#382E32] bg-[#1E181B] text-[#EDE4E6] transition-all duration-150 hover:border-white hover:bg-white/10 active:scale-95"
                title="Appel direct +221 77 685 21 46"
              >
                <Phone className="h-4 w-4" strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 3. BANDEAU DE BAS DE PAGE (COPYRIGHT & MENTIONS) */}
      <div className="mt-14 border-t border-[#231C1F] bg-[#0E0C0D] py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-xs text-[#8A7D81] sm:flex-row sm:flex-wrap sm:px-6 sm:text-left lg:flex-nowrap">
          <p className="order-1 sm:order-1">
            © {new Date().getFullYear()} <strong className="text-[#CBBFC2]">DIAMA EYELASH EXTENSIONS</strong>. Tous droits réservés.
          </p>

          <p className="order-4 text-xs text-[#8A7D81] sm:order-2">
            Créé par{' '}
            <a
              href="https://mon-portfolio-five-livid.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[#CBBFC2] underline decoration-[#D88B99]/60 underline-offset-4 transition-colors hover:text-white hover:decoration-[#D88B99]"
            >
              HYPNOTYZED
            </a>
          </p>

          <p className="order-2 flex items-center gap-1.5 text-[11px] sm:order-3">
            <span>Créé avec soin pour sublimer le regard des femmes à Dakar</span>
            <Heart className="h-3 w-3 text-[#D88B99]" fill="currentColor" />
          </p>

          <div className="order-3 flex items-center gap-4 text-xs sm:order-4">
            <Link href="/a-savoir" className="transition-colors hover:text-white">
              Règles du Studio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
