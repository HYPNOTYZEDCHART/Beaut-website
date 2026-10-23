'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { WhatsAppIcon } from '@/components/ui/SocialIcons';
import { buildGeneralContactWhatsAppUrl } from '@/lib/whatsapp';

interface FloatingWhatsAppButtonProps {
  phone?: string;
}

export function FloatingWhatsAppButton({
  phone = '+221776852146',
}: FloatingWhatsAppButtonProps) {
  const pathname = usePathname();

  // Ne pas afficher sur le tunnel de réservation ni sur l'espace d'administration pour éviter tout conflit tactile
  if (pathname?.startsWith('/reserver') || pathname?.startsWith('/admin')) {
    return null;
  }

  const whatsappUrl = buildGeneralContactWhatsAppUrl(phone);

  return (
    <aside
      aria-label="Contact direct WhatsApp"
      className="fixed bottom-6 right-5 z-40 flex items-center gap-2.5"
    >
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discuter directement avec Diama sur WhatsApp"
        className="group relative flex items-center gap-2.5 rounded-full bg-[#25D366] px-4 py-3 text-white shadow-[0_10px_25px_rgba(37,211,102,0.35)] transition-all duration-200 ease-emil-out hover:bg-[#20BD5A] hover:shadow-[0_14px_30px_rgba(37,211,102,0.45)] hover:-translate-y-0.5 active:scale-95 sm:px-5"
      >
        {/* Halo de pulsation subtile */}
        <span
          aria-hidden="true"
          className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/30 duration-1000"
        />

        <WhatsAppIcon className="h-6 w-6 text-white shrink-0 drop-shadow-sm" />

        <span className="hidden font-sans text-xs font-semibold tracking-wide text-white drop-shadow-sm sm:inline-block">
          Discuter sur WhatsApp
        </span>
      </a>
    </aside>
  );
}
