import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  Download,
  Heart,
  Instagram,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import { loadContactSettings } from '@/lib/catalog-fallback';
import { buildGeneralContactWhatsAppUrl } from '@/lib/whatsapp';

export async function Footer() {
  const settings = await loadContactSettings();
  const whatsappUrl = buildGeneralContactWhatsAppUrl(settings.whatsappPhone);
  const cleanInsta = settings.instagramHandle.replace(/^@/, '');
  const instagramUrl = `https://instagram.com/${cleanInsta}`;

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
                Studio Privé Haute Couture • Dakar Mermoz
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
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#C47482] px-6 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(196,116,130,0.35)] transition-all duration-200 hover:bg-[#B36270] hover:scale-[1.02] active:scale-[0.98]"
              >
                <Calendar className="h-4 w-4" strokeWidth={1.75} />
                <span>Réserver mon créneau</span>
              </Link>
              <a
                href="/guides/Guide_Reservation_Diama_Eyelash.pdf"
                download="Guide_Reservation_Diama_Eyelash.pdf"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#44383C] bg-white/5 px-5 text-sm font-medium text-white transition-all duration-200 hover:border-[#D88B99]/50 hover:bg-white/10"
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

      {/* 3. GRILLE PRINCIPALE 4 COLONNES */}
      <div className="mx-auto mt-14 max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Colonne Marque (lg:col-span-4) */}
          <div className="space-y-4 lg:col-span-4">
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
              Studio privé dédié à l’art des extensions de cils haute couture à Dakar. Chaque regard est sculpté
              avec patience, douceur et rigueur pour sublimer votre beauté naturelle sans compromis sur le confort.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Diama Eyelash Extensions"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#332A2E] bg-[#1D171A] text-[#D88B99] transition-colors hover:border-[#D88B99] hover:bg-[#D88B99]/10"
              >
                <Instagram className="h-4 w-4" strokeWidth={1.75} />
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Diama Eyelash Extensions"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#332A2E] bg-[#1D171A] text-[#25D366] transition-colors hover:border-[#25D366] hover:bg-[#25D366]/10"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
              </a>
              <a
                href="tel:+221773956966"
                aria-label="Appeler Diama"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#332A2E] bg-[#1D171A] text-[#EDE4E6] transition-colors hover:border-white hover:bg-white/10"
              >
                <Phone className="h-4 w-4" strokeWidth={1.75} />
              </a>
            </div>
          </div>

          {/* Colonne 2 : Les Poses & Tarifs (lg:col-span-3) */}
          <div className="space-y-3 lg:col-span-3">
            <p className="font-serif text-sm font-semibold uppercase tracking-wider text-white">
              Les Poses & Tarifs
            </p>
            <ul className="space-y-2.5 text-xs text-[#B8ABB0]">
              <li>
                <Link
                  href="/prestations#cil-a-cil"
                  className="flex items-center justify-between transition-colors hover:text-white"
                >
                  <span>Cil à Cil Naturel</span>
                  <span className="font-medium text-[#E5A5B1]">15 000 FCFA</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/prestations#pose-mixte"
                  className="flex items-center justify-between transition-colors hover:text-white"
                >
                  <span>Pose Mixte Hybride</span>
                  <span className="font-medium text-[#E5A5B1]">18 000 FCFA</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/prestations#volume-leger"
                  className="flex items-center justify-between transition-colors hover:text-white"
                >
                  <span>Volume Léger (Soft Russe)</span>
                  <span className="font-medium text-[#E5A5B1]">20 000 FCFA</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/prestations#volume-intense"
                  className="flex items-center justify-between transition-colors hover:text-white"
                >
                  <span>Volume Russe Intense</span>
                  <span className="font-medium text-[#E5A5B1]">25 000 FCFA</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/prestations#remplissage"
                  className="flex items-center justify-between transition-colors hover:text-white"
                >
                  <span>Remplissage (2–3 sem.)</span>
                  <span className="font-medium text-[#E5A5B1]">12 000 FCFA</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 3 : Navigation & Studio (lg:col-span-2) */}
          <div className="space-y-3 lg:col-span-2">
            <p className="font-serif text-sm font-semibold uppercase tracking-wider text-white">
              Navigation
            </p>
            <ul className="space-y-2 text-xs text-[#B8ABB0]">
              <li>
                <Link href="/" className="transition-colors hover:text-white">
                  Accueil du Studio
                </Link>
              </li>
              <li>
                <Link href="/prestations" className="transition-colors hover:text-white">
                  Tarifs & Poses
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
                  Contact & Accès
                </Link>
              </li>
              <li>
                <Link href="/reserver" className="font-medium text-[#E5A5B1] transition-colors hover:underline">
                  Prendre Rendez-vous
                </Link>
              </li>
            </ul>
          </div>

          {/* Colonne 4 : Studio & Infos Pratiques (lg:col-span-3) */}
          <div className="space-y-3 lg:col-span-3">
            <p className="font-serif text-sm font-semibold uppercase tracking-wider text-white">
              Studio & Horaires
            </p>
            <ul className="space-y-2.5 text-xs text-[#B8ABB0]">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D88B99]" strokeWidth={1.75} />
                <span>{settings.zoneLabel || 'Dakar, Mermoz Pyrotechnie (sur RDV)'}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D88B99]" strokeWidth={1.75} />
                <span>Lundi au Samedi : 09h00 – 19h30</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#D88B99]" strokeWidth={1.75} />
                <span>WhatsApp : +221 77 395 69 66</span>
              </li>
              <li className="pt-2 text-[11px] leading-relaxed text-[#8E8084]">
                Acomptes acceptés via <strong className="text-white">Wave</strong> et <strong className="text-white">Max it (Orange Money)</strong>.
                Solde restant à régler sur place.
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
            <span>•</span>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 text-[#C47482] transition-colors hover:text-[#E5A5B1]"
              title="Accès sécurisé pour la gérante"
            >
              <Lock className="h-3 w-3" strokeWidth={1.75} />
              <span>Espace Praticienne</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
