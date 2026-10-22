import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
  themeColor: '#FFFFFF',
};

export const metadata: Metadata = {
  title: 'TON ESPACE BEAUTÉ | Extensions de Cils à Dakar',
  description:
    'Réservez votre pose d’extensions de cils (Cil à cil, Pose Mixte, Volume Léger, Volume Intense) en ligne selon les créneaux disponibles à Dakar.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh bg-white font-sans text-[#1C191A] antialiased selection:bg-[#F9EBEF] selection:text-[#1C191A]">
        <div
          vaul-drawer-wrapper=""
          className="flex min-h-dvh flex-col bg-white"
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster
          position="top-center"
          theme="light"
          mobileOffset={16}
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#1C191A',
              border: '1px solid #F3E1E6',
              borderRadius: '16px',
              boxShadow: '0 8px 30px rgb(216, 139, 153, 0.12)',
            },
          }}
        />
      </body>
    </html>
  );
}

