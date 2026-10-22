'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { cn } from '@/lib/cn';
import { LashLogoMark } from '@/components/ui/LashLogoMark';

const TRAIN_WAGONS = [
  { id: 'accueil', href: '/#accueil', label: '01. Accueil' },
  { id: 'prestations', href: '/#prestations', label: '02. Poses & Tarifs' },
  { id: 'a-savoir', href: '/#a-savoir', label: '03. À savoir' },
  { id: 'avis', href: '/#avis', label: '04. Avis' },
  { id: 'contact', href: '/#contact', label: '05. Contact' },
] as const;

const HIGH_INTENSITY_SPRING = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 28,
};

export function Navbar() {
  const pathname = usePathname();
  const [activeWagon, setActiveWagon] = useState<string>('accueil');

  useEffect(() => {
    if (pathname !== '/') return;

    const syncFromHash = () => {
      const rawHash = window.location.hash.replace(/^#/, '');
      if (rawHash && TRAIN_WAGONS.some((w) => w.id === rawHash)) {
        setActiveWagon(rawHash);
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);

    const sectionElements = TRAIN_WAGONS.map((w) =>
      document.getElementById(w.id)
    ).filter((el): el is HTMLElement => el !== null);

    if (sectionElements.length === 0) {
      return () => window.removeEventListener('hashchange', syncFromHash);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveWagon(entry.target.id);
          }
        }
      },
      {
        rootMargin: '-25% 0px -55% 0px',
        threshold: 0.05,
      }
    );

    for (const el of sectionElements) {
      observer.observe(el);
    }

    return () => {
      observer.disconnect();
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-[#F3E1E6] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <Link
          href="/#accueil"
          onClick={() => setActiveWagon('accueil')}
          className="group inline-flex items-center gap-2.5 font-serif text-lg font-semibold tracking-wider text-[#1C191A] sm:text-xl"
        >
          <span className="inline-flex h-9 w-10 items-center justify-center overflow-hidden rounded-xl border border-[#F3E1E6] bg-[#FAF7F5] p-0.5 shadow-powdery transition-transform duration-150 ease-emil-out group-active:scale-[0.96]">
            <img
              src="/images/diama-logo.jpg"
              alt="Logo Diama Eyelash Extensions"
              className="h-full w-full object-contain"
            />
          </span>
          <span>DIAMA EYELASH EXTENSIONS</span>
        </Link>

        {/* Navigation Desktop par wagons avec glissement layoutId */}
        <nav
          className="hidden items-center gap-1 rounded-full border border-[#F3E1E6] bg-[#FDF8F9] p-1 md:flex"
          aria-label="Wagons de la page"
        >
          {TRAIN_WAGONS.map((wagon) => {
            const isActive =
              pathname === '/'
                ? activeWagon === wagon.id
                : pathname.startsWith(`/${wagon.id}`);
            return (
              <Link
                key={wagon.id}
                href={wagon.href}
                onClick={() => setActiveWagon(wagon.id)}
                className={cn(
                  'relative rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 tabular-nums',
                  isActive
                    ? 'text-[#1C191A] font-semibold'
                    : 'text-[#786B6E] hover:text-[#1C191A]'
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="active-wagon-desktop-pill"
                    transition={HIGH_INTENSITY_SPRING}
                    className="pointer-events-none absolute inset-0 rounded-full border border-[#D88B99] bg-[#F9EBEF]"
                  />
                )}
                <span className="relative z-10">{wagon.label}</span>
              </Link>
            );
          })}
        </nav>

        <Link
          href="/reserver"
          className="relative inline-flex min-h-10 items-center gap-2 overflow-hidden rounded-full bg-[#C47482] px-4 py-2 text-xs font-semibold text-white shadow-powdery transition-[transform,background-color] duration-150 ease-emil-out active:scale-[0.96] hover:bg-[#B36270] sm:text-sm"
        >
          <span
            aria-hidden="true"
            className="shimmer-sheen pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-transparent via-[#FDF8F9]/25 to-transparent"
          />
          <Calendar className="relative z-10 h-3.5 w-3.5" strokeWidth={1.5} />
          <span className="relative z-10">Réserver</span>
        </Link>
      </div>

      {/* Rail horizontal des wagons sur Mobile avec morphing layoutId & défilement fluide sans barre visible */}
      <nav
        aria-label="Navigation mobile par wagons"
        className="flex items-center gap-1.5 overflow-x-auto border-t border-[#F3E1E6]/80 bg-[#FDF8F9]/95 px-4 py-2 md:hidden [touch-action:pan-x] scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {TRAIN_WAGONS.map((wagon) => {
          const isActive =
            pathname === '/'
              ? activeWagon === wagon.id
              : pathname.startsWith(`/${wagon.id}`);
          return (
            <Link
              key={wagon.id}
              href={wagon.href}
              onClick={() => setActiveWagon(wagon.id)}
              className={cn(
                'relative whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium tabular-nums transition-transform duration-150 active:scale-[0.96]',
                isActive ? 'text-[#1C191A] font-semibold' : 'text-[#786B6E]'
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="active-wagon-mobile-pill"
                  transition={HIGH_INTENSITY_SPRING}
                  className="pointer-events-none absolute inset-0 rounded-full border border-[#D88B99] bg-[#F9EBEF]"
                />
              )}
              <span className="relative z-10">{wagon.label}</span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
