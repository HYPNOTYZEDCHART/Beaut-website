import React from 'react';
import { loadVitrineData } from '@/lib/catalog-fallback';
import { LongScrollTrainExperience } from '@/components/vitrine/LongScrollTrainExperience';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { settings, services, reviews, averageRating, totalReviews } =
    await loadVitrineData();

  return (
    <LongScrollTrainExperience
      settings={settings}
      services={services}
      reviews={reviews}
      averageRating={averageRating}
      totalReviews={totalReviews}
    />
  );
}
