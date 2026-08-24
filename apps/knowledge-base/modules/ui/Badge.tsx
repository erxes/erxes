import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type BadgeTone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger';

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-subtle text-muted',
  brand: 'bg-brand-soft text-brand',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
};

export const Badge = ({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: BadgeTone;
  className?: string;
  children: ReactNode;
}) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
      tones[tone],
      className,
    )}
  >
    {children}
  </span>
);
