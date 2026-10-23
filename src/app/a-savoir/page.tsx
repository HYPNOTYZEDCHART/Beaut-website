import React from 'react';
import Link from 'next/link';
import {
  MapPin,
  Sparkles,
  Clock,
  CalendarClock,
  Wallet,
  Calendar,
} from 'lucide-react';
import { loadContactSettings } from '@/lib/catalog-fallback';
import { WaveAndOmBadge } from '@/components/ui/PaymentLogos';

export const revalidate = 60;

export default async function ASavoirPage() {
  const settings = await loadContactSettings();

  return (
    <div className="bg-white py-10 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B36270]">
            Informations Essentielles
          </p>
          <h1 className="mt-1 font-serif text-3xl font-semibold text-[#1C191A] sm:text-4xl">
            À savoir avant de venir
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#786B6E] sm:text-base">
            Pour vous garantir une séance calme, ponctuelle et respectueuse de
            mon emploi du temps d’études, voici les règles de fonctionnement du
            studio.
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-[26px] border border-[#F3E1E6] bg-[#FDF8F9] p-4 shadow-powdery sm:p-5">
          <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-[#F3E1E6] bg-white sm:h-72">
            <img
              src="/images/studio-seance-pose.jpg"
              alt="Séance de pose d’extensions de cils au studio privé DIAMA EYELASH EXTENSIONS à Dakar"
              className="h-full w-full object-cover object-[center_38%]"
            />
          </div>
        </div>

        <div className="mt-6 space-y-5">
          {/* 1. Zone géographique & Adresse masquée */}
          <section className="rounded-[24px] border border-[#F3E1E6] bg-[#FDF8F9] p-6 shadow-powdery">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#F3E1E6] bg-white text-[#D88B99]">
                <MapPin className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1C191A]">
                  1. Localisation & Confidentialité de l’adresse
                </h2>
                <p className="text-xs text-[#786B6E]">{settings.zoneLabel}</p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#1C191A]">
              Le studio est situé à Dakar (secteur Diamalaye, repère Croisement Grand Médine). Par
              mesure de tranquillité et de sécurité,{' '}
              <strong>
                l’adresse exacte ainsi que la localisation précise sont
                communiquées uniquement après la validation de votre acompte
              </strong>
              .
            </p>
          </section>

          {/* 2. Préparation avant le rendez-vous */}
          <section className="rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#F3E1E6] bg-[#FDF8F9] text-[#D88B99]">
                <Sparkles className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h2 className="font-serif text-2xl font-semibold text-[#1C191A]">
                2. Préparation avant votre séance
              </h2>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#786B6E]">
              <li>
                • <strong className="text-[#1C191A]">Yeux 100 % démaquillés :</strong>{' '}
                Venez sans mascara, sans eye-liner et sans résidu de maquillage.
              </li>
              <li>
                • <strong className="text-[#1C191A]">Zéro corps gras :</strong>{' '}
                N’appliquez aucune huile ou crème riche sur le contour des yeux
                dans les 24h précédant la pose (cela empêche la colle d’adhérer).
              </li>
              <li>
                • <strong className="text-[#1C191A]">Cils naturels & Remplissage :</strong>{' '}
                Les poses complètes s’effectuent sur cils naturels uniquement.
                Aucun remplissage n’est effectué sur une pose provenant d’un
                autre salon.
              </li>
              <li>
                • <strong className="text-[#1C191A]">Accompagnateurs :</strong>{' '}
                Pour préserver le calme de la séance, merci de venir seule.
              </li>
            </ul>
          </section>

          {/* 3. Règles de retard */}
          <section className="rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#F3E1E6] bg-[#FDF8F9] text-[#D88B99]">
                <Clock className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h2 className="font-serif text-2xl font-semibold text-[#1C191A]">
                3. Ponctualité & Règles de retard
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#786B6E] tabular-nums">
              Chaque créneau est calculé à la minute près avec un temps dédié au
              nettoyage et à la désinfection du matériel entre deux clientes.{' '}
              <strong className="text-[#1C191A]">
                Au-delà de 15 minutes de retard, le rendez-vous est
                automatiquement annulé
              </strong>{' '}
              afin de ne pas pénaliser la cliente suivante ni mes horaires de
              cours, et l’acompte n’est pas remboursable.
            </p>
          </section>

          {/* 4. Délai de réservation, d'annulation et de report */}
          <section className="rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#F3E1E6] bg-[#FDF8F9] text-[#D88B99]">
                <CalendarClock className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <h2 className="font-serif text-2xl font-semibold text-[#1C191A]">
                4. Délai de réservation, report & annulation
              </h2>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#786B6E] tabular-nums">
              Les réservations se prennent au minimum{' '}
              <strong className="text-[#1C191A]">
                {settings.minNoticeHours} à 48 heures à l’avance
              </strong>
              . Tout souhait de report doit être signalé au minimum{' '}
              <strong className="text-[#1C191A]">24 heures avant</strong> l’heure
              prévue du rendez-vous.
            </p>
          </section>

          {/* 5. Politique d'acompte (Wave / Orange Money) */}
          <section className="rounded-[24px] border border-[#F3E1E6] bg-[#FDF8F9] p-6 shadow-powdery">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#F3E1E6] bg-white text-[#D88B99]">
                <Wallet className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-serif text-2xl font-semibold text-[#1C191A]">
                  5. Politique d’acompte
                </h2>
                <WaveAndOmBadge size="md" />
              </div>
            </div>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[#786B6E] tabular-nums">
              <li>
                • Un <strong className="text-[#1C191A]">acompte obligatoire</strong> (défini selon la prestation choisie) est requis pour bloquer et confirmer définitivement votre créneau.
              </li>
              <li>
                • Le montant de cet acompte est <strong className="text-[#1C191A]">intégralement déduit</strong> du tarif total le jour de votre rendez-vous.
              </li>
              <li>
                • <strong className="text-[#1C191A]">Non remboursable</strong> en cas d’annulation à moins de 24h, d’oubli ou de retard supérieur à 15 minutes.
              </li>
              <li>
                • <strong className="text-[#1C191A]">Reportable 1 seule fois</strong> si vous prévenez au moins 24h à l’avance.
              </li>
              <li>
                • <strong className="text-[#1C191A]">100 % remboursé</strong> si un imprévu universitaire ou personnel oblige la praticienne à annuler la séance.
              </li>
            </ul>
          </section>

          {/* 6. Entretien & Soins post-pose (Aftercare) */}
          <section
            id="aftercare"
            className="scroll-mt-24 rounded-[26px] border border-[#F3E1E6] bg-[#FDF8F9] p-6 shadow-powdery sm:p-8"
          >
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#F3E1E6] bg-white text-[#D88B99]">
                <Sparkles className="h-5 w-5" strokeWidth={1.5} />
              </span>
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#1C191A]">
                  6. Guide d’entretien post-pose (Aftercare)
                </h2>
                <p className="text-xs text-[#786B6E]">
                  Pour conserver des cils intacts, soyeux et fournis pendant 3 à 4 semaines
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 items-center gap-6 lg:grid-cols-12">
              <div className="overflow-hidden rounded-2xl border border-[#F3E1E6] bg-white p-2.5 shadow-powdery lg:col-span-5">
                <img
                  src="/images/aftercare-guide.jpg"
                  alt="Guide illustré des soins post-pose d'extensions de cils DIAMA EYELASH EXTENSIONS Dakar"
                  className="h-auto w-full rounded-xl object-contain shadow-sm"
                  loading="lazy"
                />
              </div>

              <div className="space-y-4 lg:col-span-7">
                <div className="rounded-2xl border border-[#F3E1E6] bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C191A]">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FDF8F9] text-xs font-bold text-[#B36270]">
                      1
                    </span>
                    Les 48 premières heures (Période critique de fixation)
                  </h3>
                  <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-[#786B6E] sm:text-sm">
                    <li>
                      • <strong className="text-[#1C191A]">Ne pas mouiller les cils :</strong>{' '}
                      Évitez toute eau, douche directe sur le visage, pluie et larmes pendant 48h, le temps que la colle sèche à cœur.
                    </li>
                    <li>
                      • <strong className="text-[#1C191A]">Éviter toute source de chaleur :</strong>{' '}
                      Pas de hammam, sauna, vapeur intense ou sèche-cheveux orienté vers le visage.
                    </li>
                    <li>
                      • <strong className="text-[#1C191A]">Ne pas brosser excessivement :</strong>{' '}
                      Laissez vos extensions se stabiliser les deux premiers jours.
                    </li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-[#F3E1E6] bg-white p-5 shadow-sm">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-[#1C191A]">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#FDF8F9] text-xs font-bold text-[#B36270]">
                      2
                    </span>
                    Au quotidien (Durabilité & Protection naturelle)
                  </h3>
                  <ul className="mt-2.5 space-y-2 text-xs leading-relaxed text-[#786B6E] sm:text-sm">
                    <li>
                      • <strong className="text-[#1C191A]">Zéro corps gras sur les cils :</strong>{' '}
                      Bannissez les huiles, sérums huileux et démaquillants biphasés (le gras dissout la colle).
                    </li>
                    <li>
                      • <strong className="text-[#1C191A]">Ne pas frotter ni tirer :</strong>{' '}
                      Brossez doucement le matin avec votre goupillon propre offert au studio, sans jamais tirer.
                    </li>
                    <li>
                      • <strong className="text-[#1C191A]">Ne pas dormir sur le visage :</strong>{' '}
                      Dormez sur le dos ou sur le côté pour éviter d'écraser vos éventails contre l'oreiller.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/reserver"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C47482] px-8 py-3.5 text-sm font-medium text-white shadow-powderyLg transition-transform duration-150 ease-emil-out active:scale-[0.98] hover:bg-[#B36270]"
          >
            <Calendar className="h-4 w-4" strokeWidth={1.5} />
            <span>J’ai lu les conditions, réserver mon créneau</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

