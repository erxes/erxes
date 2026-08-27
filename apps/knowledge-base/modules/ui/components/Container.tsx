import type { ReactNode } from 'react';
import { cn } from '@/modules/ui/lib/cn';

/**
 * Every page and every piece of chrome is centred by this one component, so the
 * header, the content and the footer always share the same vertical edges.
 */
const widths = {
  /** Page chrome and grid-driven pages. */
  shell: 'max-w-7xl',
  /** Single-column lists and detail pages. */
  wide: 'max-w-5xl',
  /** Long-form reading and focused forms, kept near 70 characters a line. */
  text: 'max-w-3xl',
  /** Auth cards. */
  form: 'max-w-md',
} as const;

export type ContainerWidth = keyof typeof widths;

export const Container = ({
  width = 'shell',
  className,
  children,
}: {
  width?: ContainerWidth;
  className?: string;
  children: ReactNode;
}) => (
  <div
    className={cn(
      'mx-auto w-full px-5 sm:px-8 lg:px-10',
      widths[width],
      className,
    )}
  >
    {children}
  </div>
);
