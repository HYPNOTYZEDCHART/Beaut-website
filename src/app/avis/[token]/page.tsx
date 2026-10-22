import React from 'react';
import Link from 'next/link';
import { getReviewInvitationByTokenAction } from '@/actions/review.actions';
import { ReviewTokenForm } from '@/components/reviews/ReviewTokenForm';

export const dynamic = 'force-dynamic';

interface ReviewTokenPageProps {
  params: Promise<{ token: string }>;
}

export default async function ReviewTokenPage({
  params,
}: ReviewTokenPageProps) {
  const { token } = await params;
  const response = await getReviewInvitationByTokenAction(token);

  // Support d'un jeton de démonstration `demo-token` ou `seed-verified-token-teb-1001` si BDD hors-ligne
  const invitation = response.success
    ? response.data
    : token === 'demo-token'
      ? {
          token: 'demo-token',
          clientFirstNamePreview: 'Aïssatou',
          clientInitialPreview: 'Aïssatou N.',
          serviceName: 'Pose Mixte',
          dateKey: '2026-10-21',
          alreadySubmitted: false,
          isExpired: false,
        }
      : null;

  return (
    <div className="min-h-[82dvh] bg-[#FDF8F9] py-10 sm:py-16">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        {invitation ? (
          <ReviewTokenForm invitation={invitation} />
        ) : (
          <div className="rounded-[28px] border border-[#F3E1E6] bg-white p-8 text-center shadow-powdery">
            <h1 className="font-serif text-2xl font-semibold text-[#1C191A]">
              Lien d’avis introuvable
            </h1>
            <p className="mt-2 text-sm text-[#786B6E]">
              {response.success
                ? ''
                : response.error}
            </p>
            <div className="mt-6">
              <Link
                href="/avis"
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#C47482] px-6 py-3 text-xs font-medium text-white"
              >
                Voir les avis publiés
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

