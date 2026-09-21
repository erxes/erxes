import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/modules/ui/lib/cn';

const surface = 'rounded-xl border border-line bg-white shadow-card';

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => <div className={cn(surface, className)}>{children}</div>;

export const cardLinkClass = (className?: string) =>
  cn(
    surface,
    'block transition-[box-shadow,border-color,transform] duration-200 ease-out',
    'hover:-translate-y-px hover:border-brand/25 hover:shadow-card-hover',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2',
    className,
  );

type CardLinkProps = ComponentProps<typeof Link>;

export const CardLink = ({ className, ...props }: CardLinkProps) => (
  <Link className={cardLinkClass(className)} {...props} />
);
