'use client';

import React from 'react';
import { cn } from '@/lib/cn';

export type TactileButtonVariant = 'primary' | 'dark' | 'secondary' | 'ghost';

interface TactileButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: TactileButtonVariant;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<TactileButtonVariant, string> = {
  primary:
    'bg-[#C47482] text-white border border-transparent shadow-powdery hover:bg-[#B36270]',
  dark: 'bg-[#1C191A] text-white border border-[#D88B99]/30 shadow-[0_8px_28px_rgb(216,139,153,0.18)] hover:bg-[#2B2628]',
  secondary:
    'bg-white text-[#1C191A] border border-[#F3E1E6] shadow-powdery hover:bg-[#FDF8F9] hover:border-[#D88B99]/50',
  ghost:
    'bg-transparent text-[#786B6E] border border-transparent hover:bg-[#FDF8F9] hover:text-[#1C191A]',
};

export function TactileButton({
  children,
  variant = 'primary',
  isLoading = false,
  fullWidth = false,
  disabled,
  className,
  type = 'button',
  ...props
}: TactileButtonProps) {
  const isDisabled = Boolean(disabled || isLoading);

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={cn(
        'relative inline-flex min-h-12 select-none items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium tracking-wide',
        'transition-[transform,background-color,border-color,opacity,box-shadow] duration-150 ease-emil-out',
        'active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D88B99] focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-[filter,opacity] duration-200 ease-emil-out',
          isLoading ? 'opacity-75 blur-[1.5px]' : 'opacity-100 blur-0'
        )}
      >
        {children}
      </span>
    </button>
  );
}

