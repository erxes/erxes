import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/modules/ui/lib/cn';

const surface = 'rounded-xl border border-line bg-white';

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => <div className={cn(surface, className)}>{children}</div>;

type CardLinkProps = ComponentProps<typeof Link>;

export const CardLink = ({ className, ...props }: CardLinkProps) => (
  <Link
    className={cn(
      surface,
      'block transition-all duration-200 hover:border-brand/30 hover:shadow-[0_8px_24px_rgba(23,22,42,0.08)]',
      className,
    )}
    {...props}
  />
);
