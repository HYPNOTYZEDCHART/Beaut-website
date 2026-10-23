import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Logo officiel Wave Sénégal (Bleu #1BA5E0 avec le pingouin stylisé blanc)
 */
export function WaveLogo({ className = 'h-5 w-5', size }: LogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Wave Sénégal"
      role="img"
    >
      <circle cx="20" cy="20" r="20" fill="#1BA5E0" />
      {/* Silhouette du pingouin Wave */}
      <path
        d="M20 7C16.134 7 13 10.134 13 14C13 16.5 14.3 18.7 16.3 19.9C15.5 21.3 15 23.1 15 25C15 28.9 17.2 32 20 32C22.8 32 25 28.9 25 25C25 23.1 24.5 21.3 23.7 19.9C25.7 18.7 27 16.5 27 14C27 10.134 23.866 7 20 7Z"
        fill="#FFFFFF"
      />
      {/* Ventre blanc épuré & yeux */}
      <circle cx="18" cy="13.5" r="1.3" fill="#141213" />
      <circle cx="22" cy="13.5" r="1.3" fill="#141213" />
      {/* Bec orange */}
      <path
        d="M18.8 15.5H21.2L20 17.5L18.8 15.5Z"
        fill="#FF9800"
      />
      {/* Nageoires */}
      <path
        d="M12.5 19.5C11.5 21 11.5 23 12.5 24.5C13.5 23.5 14 21.5 13.5 20L12.5 19.5Z"
        fill="#1BA5E0"
      />
      <path
        d="M27.5 19.5C28.5 21 28.5 23 27.5 24.5C26.5 23.5 26 21.5 26.5 20L27.5 19.5Z"
        fill="#1BA5E0"
      />
    </svg>
  );
}

/**
 * Logo officiel Orange Money (Orange #FF7900 avec signature OM blanche)
 */
export function OrangeMoneyLogo({ className = 'h-5 w-5', size }: LogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Orange Money Sénégal (Max it)"
      role="img"
    >
      <rect width="40" height="40" rx="9" fill="#FF7900" />
      {/* Monogramme OM stylisé officiel */}
      <circle cx="16" cy="20" r="7" stroke="#FFFFFF" strokeWidth="3" fill="none" />
      <path
        d="M25 13V27M25 14L28.5 20.5L32 14V27"
        stroke="#FFFFFF"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Duo compact des 2 logos Wave + Orange Money côte à côte
 */
export function WaveAndOmBadge({
  size = 'md',
  className = '',
}: {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const dimensions = {
    sm: { logo: 'h-4 w-4', gap: 'gap-1.5' },
    md: { logo: 'h-5 w-5', gap: 'gap-2' },
    lg: { logo: 'h-7 w-7', gap: 'gap-2.5' },
  }[size];

  return (
    <div className={`inline-flex items-center justify-center ${dimensions.gap} ${className}`}>
      <WaveLogo className={`${dimensions.logo} shrink-0 drop-shadow-sm`} />
      <OrangeMoneyLogo className={`${dimensions.logo} shrink-0 drop-shadow-sm`} />
    </div>
  );
}
