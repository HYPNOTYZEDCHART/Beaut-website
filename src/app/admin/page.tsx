import React from 'react';
import { loadVitrineData } from '@/lib/catalog-fallback';
import { AdminDashboardClient } from '@/components/admin/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const { settings } = await loadVitrineData();

  return (
    <div className="min-h-[85dvh] bg-[#FDF8F9]">
      <AdminDashboardClient initialSettings={settings} />
    </div>
  );
}

