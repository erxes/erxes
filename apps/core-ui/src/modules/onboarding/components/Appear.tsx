import { cn } from 'erxes-ui';
import type { ReactNode } from 'react';

export const EASE_OUT_QUAD = 'var(--ease-out-quad)';
export const EASE_SPRING = 'var(--ease-spring)';

/** An entrance animation (`animate-appear`): fades in from an offset and/or scale. */
export const Appear = ({
  x = 0,
  y = 0,
  scale = 1,
  duration = 500,
  delay = 0,
  easing = 'ease-out',
  className,
  children,
}: {
  x?: number;
  y?: number;
  scale?: number;
  duration?: number;
  delay?: number;
  easing?: string;
  className?: string;
  children?: ReactNode;
}) => (
  <div
    className={cn('animate-appear', className)}
    style={{
      '--appear-x': `${x}px`,
      '--appear-y': `${y}px`,
      '--appear-scale': scale,
      '--appear-duration': `${duration}ms`,
      '--appear-delay': `${delay}ms`,
      '--appear-easing': easing,
    }}
  >
    {children}
  </div>
);
