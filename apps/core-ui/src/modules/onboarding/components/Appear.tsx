import { cn } from 'erxes-ui';
import type { CSSProperties, ReactNode } from 'react';

export const EASE_OUT_QUAD = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
export const EASE_SPRING = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

/**
 * An entrance animation: fades in from an offset and/or scale, through
 * tailwindcss-animate's `animate-in`.
 */
export const appearStyle = ({
  x = 0,
  y = 0,
  scale = 1,
  duration = 500,
  delay = 0,
  easing = 'ease-out',
}: {
  x?: number;
  y?: number;
  scale?: number;
  duration?: number;
  delay?: number;
  easing?: string;
}) =>
  ({
    '--tw-enter-opacity': '0',
    '--tw-enter-translate-x': `${x}px`,
    '--tw-enter-translate-y': `${y}px`,
    '--tw-enter-scale': String(scale),
    animationDuration: `${duration}ms`,
    animationDelay: `${delay}ms`,
    animationTimingFunction: easing,
    animationFillMode: 'both',
  }) as CSSProperties;

export const Appear = ({
  className,
  children,
  ...options
}: Parameters<typeof appearStyle>[0] & { className?: string; children?: ReactNode }) => (
  <div className={cn('animate-in', className)} style={appearStyle(options)}>
    {children}
  </div>
);
