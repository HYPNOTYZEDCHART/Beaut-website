'use client';

import React, { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fin de navigation : la route ou les searchParams ont changé
  useEffect(() => {
    if (isNavigating) {
      setProgress(100);
      const timer = setTimeout(() => {
        setIsNavigating(false);
        setProgress(0);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  // Écouteur global ultra-rapide au clic sur les liens internes
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      // Ignore les liens externes, les ancres pures de la même page sans changement de route, target=_blank, ou les clics modifiés (cmd/ctrl)
      if (
        !href ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        target.target === '_blank' ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Si c'est un lien interne vers une autre page ou vers l'accueil depuis une sous-page
      const currentUrl = window.location.pathname + window.location.search;
      if (href !== currentUrl && !href.startsWith(currentUrl + '#')) {
        setIsNavigating(true);
        setProgress(25);
        const timer1 = setTimeout(() => setProgress(65), 100);
        const timer2 = setTimeout(() => setProgress(85), 350);
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    };

    const handlePopState = () => {
      setIsNavigating(true);
      setProgress(40);
    };

    document.addEventListener('click', handleDocumentClick, { capture: true });
    window.addEventListener('popstate', handlePopState);

    return () => {
      document.removeEventListener('click', handleDocumentClick, { capture: true });
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  if (!isNavigating && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[2.5px] w-full overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-[#E7A9B5] via-[#C47482] to-[#B36270] shadow-[0_0_8px_rgba(196,116,130,0.6)] transition-all duration-200 ease-out"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
        }}
      />
    </div>
  );
}
