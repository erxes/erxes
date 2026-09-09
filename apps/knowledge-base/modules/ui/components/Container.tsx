import type { ReactNode } from 'react';
import { cn } from '@/modules/ui/lib/cn';

const widths = {
  shell: 'max-w-7xl',
  text: 'max-w-3xl',
  form: 'max-w-md',
} as const;

export type ContainerWidth = keyof typeof widths;

export const Container = ({
  width = 'shell',
  column,
  className,
  children,
}: {
  width?: ContainerWidth;
  column?: ContainerWidth;
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
    {column ? (
      <div className={cn('mx-auto w-full', widths[column])}>{children}</div>
    ) : (
      children
    )}
  </div>
);
