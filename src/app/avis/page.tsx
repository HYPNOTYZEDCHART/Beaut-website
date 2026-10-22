import React from 'react';
import Link from 'next/link';
import { Star, ShieldCheck, Calendar } from 'lucide-react';
import { loadVitrineData } from '@/lib/catalog-fallback';
import { formatDakarDateLong } from '@/lib/whatsapp';
import { PowderyBadge } from '@/components/ui/PowderyBadge';

export const revalidate = 60;

export default async function AvisPage() {
  const { reviews, averageRating, totalReviews } = await loadVitrineData();

  return (
    <div className="bg-[#FDF8F9] py-10 sm:py-16">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col justify-between gap-6 rounded-[28px] border border-[#F3E1E6] bg-white p-6 shadow-powdery sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-xl">
            <PowderyBadge variant="sage">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.5} />
              Avis 100 % vérifiés post-prestation
            </PowderyBadge>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-[#1C191A] sm:text-4xl">
              Avis de nos clientes
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#786B6E]">
              Seules les clientes ayant réellement effectué leur prestation au
              studio reçoivent un lien personnel unique sur WhatsApp pour laisser
              leur note.
            </p>
          </div>

          <div className="flex flex-col items-start rounded-2xl border border-[#F3E1E6] bg-[#FDF8F9] px-6 py-4 tabular-nums sm:items-center">
            <div className="flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-[#D88B99] text-[#D88B99]" />
              <span className="font-serif text-3xl font-semibold text-[#1C191A]">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-sm text-[#786B6E]">/ 5</span>
            </div>
            <p className="mt-1 text-xs text-[#786B6E]">
              Basé sur {totalReviews} prestations vérifiées
            </p>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex flex-col justify-between rounded-[24px] border border-[#F3E1E6] bg-white p-6 shadow-powdery"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={
                          idx < review.rating
                            ? 'h-4 w-4 fill-[#D88B99] text-[#D88B99]'
                            : 'h-4 w-4 text-[#F3E1E6]'
                        }
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                  <span className="rounded-full bg-[#F9EBEF] px-3 py-1 text-[11px] font-medium text-[#B36270]">
                    {review.serviceNameSnap}
                  </span>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-[#1C191A]">
                  « {review.comment} »
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-[#F3E1E6] pt-3 text-xs text-[#786B6E]">
                <span className="font-semibold text-[#1C191A]">
                  {review.publicDisplayName}
                </span>
                <span>
                  {formatDakarDateLong(review.submittedAtIso.slice(0, 10))}
                </span>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/reserver"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#C47482] px-7 py-3.5 text-sm font-medium text-white shadow-powdery transition-transform duration-150 ease-emil-out active:scale-[0.98] hover:bg-[#B36270]"
          >
            <Calendar className="h-4 w-4" strokeWidth={1.5} />
            <span>Réserver mon rendez-vous</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

