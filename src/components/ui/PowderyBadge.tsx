import React from 'react';
import { cn } from '@/lib/cn';

export type BadgeVariant = 'rose' | 'sage' | 'amber' | 'neutral';

interface PowderyBadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  rose: 'bg-[#F9EBEF] text-[#B36270] border-[#F3E1E6]',
  sage: 'bg-[#EBF5F0] text-[#2E7D5B] border-[#CBE6D8]',
  amber: 'bg-[#FDF4E7] text-[#B4690E] border-[#F6DFC0]',
  neutral: 'bg-[#FDF8F9] text-[#786B6E] border-[#F3E1E6]',
};

export function PowderyBadge({
  children,
  variant = 'rose',
  className,
}: PowderyBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium tracking-wide',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

