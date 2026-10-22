import React from 'react';
import { loadVitrineData } from '@/lib/catalog-fallback';
import { BookingWizard } from '@/components/booking/BookingWizard';

export const revalidate = 60;

interface ReserverPageProps {
  searchParams: Promise<{ service?: string }>;
}

export default async function ReserverPage({
  searchParams,
}: ReserverPageProps) {
  const [{ settings, services }, resolvedParams] = await Promise.all([
    loadVitrineData(),
    searchParams,
  ]);

  return (
    <div className="min-h-[85dvh] bg-[#FDF8F9]">
      <BookingWizard
        settings={settings}
        services={services}
        initialServiceSlug={resolvedParams.service}
      />
    </div>
  );
}

