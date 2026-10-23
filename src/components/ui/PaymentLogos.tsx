import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

/**
 * Véritable logo officiel Wave Sénégal (Pingouin authentique de l'application)
 */
export function WaveLogo({ className = 'h-5 w-5', size }: LogoProps) {
  return (
    <img
      src="/images/wave-logo.png"
      alt="Wave Sénégal"
      className={`inline-block rounded-full object-contain shadow-sm ${className}`}
      style={size ? { width: size, height: size } : undefined}
      loading="lazy"
      draggable={false}
    />
  );
}

/**
 * Véritable logo officiel Orange Max it (Application officielle Orange Money Sénégal)
 */
export function OrangeMoneyLogo({ className = 'h-5 w-5', size }: LogoProps) {
  return (
    <img
      src="/images/maxit-logo.png"
      alt="Orange Max it"
      className={`inline-block rounded-[6px] object-contain shadow-sm ${className}`}
      style={size ? { width: size, height: size } : undefined}
      loading="lazy"
      draggable={false}
    />
  );
}

// Alias officiel
export const MaxitLogo = OrangeMoneyLogo;

/**
 * Duo compact des 2 vrais logos Wave + Max it côte à côte
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
    <span className={`inline-flex items-center justify-center ${dimensions.gap} ${className}`}>
      <WaveLogo className={`${dimensions.logo} shrink-0`} />
      <OrangeMoneyLogo className={`${dimensions.logo} shrink-0`} />
    </span>
  );
}
