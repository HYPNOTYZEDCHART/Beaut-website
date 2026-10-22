import React from 'react';
import { cn } from '@/lib/cn';

interface LashLogoMarkProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Emblème officiel "TON ESPACE BEAUTÉ" (courbure de cils sur-mesure cil par cil avec cil central rose poudré).
 * Utilisable comme logo dans la Navbar, le Footer et dans l'écrin Hero (`LashIllustrationCard`).
 */
export function LashLogoMark({
  className,
  size = 'md',
}: LashLogoMarkProps) {
  const dimensions = {
    sm: 'h-7 w-10',
    md: 'h-9 w-12',
    lg: 'h-24 w-64',
  }[size];

  return (
    <svg
      viewBox="0 0 260 100"
      className={cn(dimensions, 'shrink-0 text-[#1C191A]', className)}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Ligne de paupière douce */}
      <path
        d="M25 58C75 82 185 82 235 58"
        stroke="#1C191A"
        strokeWidth={size === 'lg' ? '2.2' : '3.4'}
        strokeLinecap="round"
      />
      {/* Halo rose poudré subtil */}
      <path
        d="M35 54C85 76 175 76 225 54"
        stroke="#D88B99"
        strokeWidth={size === 'lg' ? '1.2' : '2.2'}
        strokeOpacity="0.65"
        strokeLinecap="round"
      />
      {/* Extensions courbées sur-mesure */}
      <path
        d="M45 64C36 46 26 32 18 22"
        stroke="#1C191A"
        strokeWidth={size === 'lg' ? '1.6' : '2.8'}
        strokeLinecap="round"
      />
      <path
        d="M68 70C62 50 54 32 48 18"
        stroke="#1C191A"
        strokeWidth={size === 'lg' ? '1.7' : '2.9'}
        strokeLinecap="round"
      />
      <path
        d="M92 74C89 52 84 32 80 14"
        stroke="#1C191A"
        strokeWidth={size === 'lg' ? '1.8' : '3'}
        strokeLinecap="round"
      />
      <path
        d="M117 76C116 54 115 32 114 12"
        stroke="#C47482"
        strokeWidth={size === 'lg' ? '2.1' : '3.4'}
        strokeLinecap="round"
      />
      <path
        d="M143 76C144 54 145 32 146 12"
        stroke="#1C191A"
        strokeWidth={size === 'lg' ? '1.9' : '3'}
        strokeLinecap="round"
      />
      <path
        d="M168 74C171 52 176 32 180 14"
        stroke="#1C191A"
        strokeWidth={size === 'lg' ? '1.8' : '3'}
        strokeLinecap="round"
      />
      <path
        d="M192 70C198 50 206 32 212 18"
        stroke="#1C191A"
        strokeWidth={size === 'lg' ? '1.7' : '2.9'}
        strokeLinecap="round"
      />
      <path
        d="M215 64C224 46 234 32 242 22"
        stroke="#1C191A"
        strokeWidth={size === 'lg' ? '1.6' : '2.8'}
        strokeLinecap="round"
      />
    </svg>
  );
}

