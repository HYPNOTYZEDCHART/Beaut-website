import React, { Suspense } from 'react';
import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingWhatsAppButton } from '@/components/ui/FloatingWhatsAppButton';
import { NavigationProgressBar } from '@/components/layout/NavigationProgressBar';
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

const getSiteUrl = () => {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    const url = process.env.NEXT_PUBLIC_APP_URL;
    return url.startsWith('http') ? url : `https://${url}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return 'https://beaut-website.vercel.app';
};

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'DIAMA EYELASH EXTENSIONS | Extensions de Cils à Dakar',
    template: '%s | DIAMA EYELASH EXTENSIONS',
  },
  description:
    'Studio privé Diama Eyelash Extensions à Dakar (Diamalaye). Réservez votre pose d’extensions de cils (Cil à cil, Pose Mixte, Volume Léger, Volume Intense) en ligne selon les vrais créneaux disponibles.',
  applicationName: 'DIAMA Eyelash Extensions',
  authors: [{ name: 'DIAMA Eyelash Extensions' }],
  keywords: [
    'extensions de cils dakar',
    'cils dakar',
    'pose cils dakar',
    'diama eyelash extensions',
    'diamalaye cils',
    'cil a cil dakar',
    'volume russe dakar',
    'studio beaute dakar',
  ],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteUrl,
    siteName: 'DIAMA EYELASH EXTENSIONS',
    title: 'DIAMA EYELASH EXTENSIONS | Extensions de Cils à Dakar',
    description:
      'Studio privé Diama Eyelash Extensions à Dakar (Diamalaye). Réservez votre pose d’extensions de cils sur-mesure en direct selon les disponibilités réelles.',
    images: [
      {
        url: '/images/diama-logo.jpg',
        width: 1200,
        height: 1200,
        alt: 'DIAMA EYELASH EXTENSIONS — Logo Studio Privé Dakar',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DIAMA EYELASH EXTENSIONS | Extensions de Cils à Dakar',
    description:
      'Studio privé Diama Eyelash Extensions à Dakar (Diamalaye). Réservez votre pose d’extensions de cils sur-mesure en ligne.',
    images: ['/images/diama-logo.jpg'],
  },
  icons: {
    icon: '/icon',
    apple: '/icon',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${cormorant.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh bg-white font-sans text-[#1C191A] antialiased selection:bg-[#F9EBEF] selection:text-[#1C191A]">
        <Suspense fallback={null}>
          <NavigationProgressBar />
        </Suspense>
        <div
          vaul-drawer-wrapper=""
          className="flex min-h-dvh flex-col bg-white"
        >
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingWhatsAppButton />
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

