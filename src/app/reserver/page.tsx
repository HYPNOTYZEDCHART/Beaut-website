import React, { Suspense } from 'react';
import { loadBookingData } from '@/lib/catalog-fallback';
import { BookingWizard } from '@/components/booking/BookingWizard';
import { BookingWizardSkeleton } from '@/components/booking/BookingWizardSkeleton';

export const revalidate = 60;

interface ReserverPageProps {
  searchParams: Promise<{ service?: string }>;
}

async function BookingWizardContent({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const [{ settings, services }, resolvedParams] = await Promise.all([
    loadBookingData(),
    searchParams,
  ]);

  return (
    <BookingWizard
      settings={settings}
      services={services}
      initialServiceSlug={resolvedParams.service}
    />
  );
}

export default function ReserverPage({ searchParams }: ReserverPageProps) {
  return (
    <div className="min-h-[85dvh] bg-[#FDF8F9]">
      <Suspense fallback={<BookingWizardSkeleton />}>
        <BookingWizardContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

