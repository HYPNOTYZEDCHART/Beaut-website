import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Download,
  Heart,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
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
      {/* 1. ÉCRIN PRE-FOOTER : CARTE D'INVITATION PRIVÉE */}
      <div className="relative mx-auto max-w-6xl px-4 pt-12 sm:px-6">
        <div className="relative overflow-hidden rounded-[32px] border border-[#382E32] bg-gradient-to-br from-[#231C1F] via-[#1D1719] to-[#171214] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.45)] sm:p-12">
          {/* Lueur d'ambiance rose poudré subtile */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#D88B99]/10 blur-3xl"
          />

          <div className="relative z-10 flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl space-y-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#D88B99]/30 bg-[#D88B99]/10 px-3.5 py-1 text-xs font-medium text-[#E5A5B1]">
                <Sparkles className="h-3.5 w-3.5 text-[#D88B99]" strokeWidth={1.5} />
                Studio Privé Haute Couture • Dakar Diamalaye
              </span>
              <h2 className="font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Prête à révéler l’intensité de votre regard ?
              </h2>
              <p className="text-sm leading-relaxed text-[#BFB0B4]">
                Prenez rendez-vous en quelques clics selon mes disponibilités réelles en direct.
                Chaque pose est réalisée cil par cil, sur-mesure, dans une atmosphère douce et apaisante.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/reserver"
                prefetch={true}
                className="group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-[#C47482] px-6 py-3 text-sm font-medium text-white shadow-powdery transition-[transform,background-color] duration-150 ease-emil-out hover:bg-[#B36270] active:scale-[0.98]"
              >
                <span
                  aria-hidden="true"
                  className="shimmer-sheen pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[#FDF8F9]/25 to-transparent"
                />
                <Calendar className="relative z-10 h-4 w-4" strokeWidth={1.75} />
                <span className="relative z-10">Réserver mon créneau</span>
              </Link>
              <a
                href="/guides/Guide_Reservation_Diama_Eyelash.pdf"
                download="Guide_Reservation_Diama_Eyelash.pdf"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#44383C] bg-white/5 px-6 py-3 text-sm font-medium text-white transition-all duration-200 hover:border-[#D88B99]/50 hover:bg-white/10 active:scale-[0.98]"
              >
                <Download className="h-4 w-4 text-[#D88B99]" strokeWidth={1.75} />
                <span>Guide PDF Cliente</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. BANDEAU DE RÉASSURANCE : LES 4 ENGAGEMENTS D'EXCELLENCE */}
      <div className="mx-auto mt-12 max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-[#2B2326] bg-[#1A1618] p-4.5 space-y-1.5">
            <div className="flex items-center gap-2.5 text-[#E5A5B1]">
              <Sparkles className="h-4 w-4" strokeWidth={1.75} />
              <span className="font-serif text-sm font-semibold text-white">100% Isolation Cil à Cil</span>
            </div>
            <p className="text-xs leading-relaxed text-[#A8989C]">
              Pose minutieuse, zéro paquet de colle. La santé et la repousse de vos cils naturels restent intactes.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2B2326] bg-[#1A1618] p-4.5 space-y-1.5">
            <div className="flex items-center gap-2.5 text-[#E5A5B1]">
              <Clock className="h-4 w-4" strokeWidth={1.75} />
              <span className="font-serif text-sm font-semibold text-white">Ponctualité & Cadre Calme</span>
            </div>
            <p className="text-xs leading-relaxed text-[#A8989C]">
              Réservation 24h à 48h à l&apos;avance. Espace calme sans accompagnateur ni retard enchaîné.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2B2326] bg-[#1A1618] p-4.5 space-y-1.5">
            <div className="flex items-center gap-2.5 text-[#E5A5B1]">
              <ShieldCheck className="h-4 w-4" strokeWidth={1.75} />
              <span className="font-serif text-sm font-semibold text-white">Acompte Sécurisé Wave / Max it</span>
            </div>
            <p className="text-xs leading-relaxed text-[#A8989C]">
              Créneau immédiatement bloqué avec référence unique. Zéro doublon ni mauvaise surprise.
            </p>
          </div>

          <div className="rounded-2xl border border-[#2B2326] bg-[#1A1618] p-4.5 space-y-1.5">
            <div className="flex items-center gap-2.5 text-[#E5A5B1]">
              <Star className="h-4 w-4 text-[#F3C474]" strokeWidth={1.75} />
              <span className="font-serif text-sm font-semibold text-white">Avis 100% Vérifiés</span>
            </div>
            <p className="text-xs leading-relaxed text-[#A8989C]">
              Seules les clientes ayant réellement honoré leur pose peuvent déposer un témoignage certifié.
            </p>
          </div>
        </div>
      </div>

      {/* 3. GRILLE PRINCIPALE 3 COLONNES AÉRÉE */}
      <div className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Colonne 1 : Marque & Réseaux Sociaux Officiels (lg:col-span-5) */}
          <div className="space-y-5 lg:col-span-5">
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

            <p className="max-w-md text-xs leading-relaxed text-[#B0A1A5]">
              Studio privé dédié à l’art des extensions de cils sur-mesure à Dakar. Chaque regard est sculpté
              avec patience, rigueur et isolation cil à cil pour sublimer votre beauté naturelle en toute sécurité.
            </p>

            {/* Boutons Sociaux Officiels */}
            <div className="space-y-2.5 pt-1">
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
                  <InstagramIcon className="h-4.5 w-4.5 fill-current" />
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
                  <TikTokIcon className="h-4.5 w-4.5 fill-current" />
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

          {/* Colonne 2 : Navigation Studio (lg:col-span-3) */}
          <div className="space-y-3 lg:col-span-3">
            <p className="font-serif text-sm font-semibold uppercase tracking-wider text-white">
              Navigation Studio
            </p>
            <ul className="space-y-2.5 text-xs text-[#B8ABB0]">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Accueil du Studio
                </Link>
              </li>
              <li>
                <Link href="/prestations" className="transition-colors hover:text-white">
                  Tarifs & Catalogue des Poses
                </Link>
              </li>
              <li>
                <Link href="/a-savoir" className="transition-colors hover:text-white">
                  Consignes & Hygiène
                </Link>
              </li>
              <li>
                <Link href="/avis" className="transition-colors hover:text-white">
                  Avis Clientes Vérifiés
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-white">
                  Contact Direct & Accès
                </Link>
              </li>
              <li className="pt-1">
                <Link
                  href="/reserver"
                  prefetch={true}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#E5A5B1] transition-colors hover:text-white hover:underline"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Prendre Rendez-vous en ligne</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Studio & Horaires Pratiques (lg:col-span-4) */}
          <div className="space-y-3 lg:col-span-4">
            <p className="font-serif text-sm font-semibold uppercase tracking-wider text-white">
              Studio & Horaires
            </p>
            <ul className="space-y-2.5 text-xs text-[#B8ABB0]">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D88B99]" strokeWidth={1.75} />
                <span>{settings.zoneLabel || 'Dakar, Diamalaye — Rue GM-01 (sur RDV)'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D88B99]" strokeWidth={1.75} />
                <span>Lundi au Samedi : 09h00 – 19h30</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D88B99]" strokeWidth={1.75} />
                <span>WhatsApp : +221 77 395 69 66</span>
              </li>
              <li className="rounded-xl border border-[#2B2326] bg-[#181416] p-3 text-[11px] leading-relaxed text-[#A8989C]">
                Acomptes de réservation sécurisés via <strong className="text-white">Wave</strong> et <strong className="text-white">Max it (Orange Money)</strong>.
                Solde restant à régler sur place après votre pose.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 4. BANDEAU DE BAS DE PAGE (COPYRIGHT & MENTIONS) */}
      <div className="mt-14 border-t border-[#231C1F] bg-[#0E0C0D] py-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center text-xs text-[#8A7D81] sm:flex-row sm:px-6 sm:text-left">
          <p>
            © {new Date().getFullYear()} <strong className="text-[#CBBFC2]">DIAMA EYELASH EXTENSIONS</strong>. Tous droits réservés.
          </p>

          <p className="flex items-center gap-1.5 text-[11px]">
            <span>Créé avec soin pour sublimer le regard des femmes à Dakar</span>
            <Heart className="h-3 w-3 text-[#D88B99]" fill="currentColor" />
          </p>

          <div className="flex items-center gap-4 text-xs">
            <Link href="/a-savoir" className="transition-colors hover:text-white">
              Règles du Studio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
