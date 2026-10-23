import React from 'react';
import { BookingWizardSkeleton } from '@/components/booking/BookingWizardSkeleton';

export default function ReserverLoading() {
  return (
    <div className="min-h-[85dvh] bg-[#FDF8F9]">
      <BookingWizardSkeleton />
    </div>
  );
}
