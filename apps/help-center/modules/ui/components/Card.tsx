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

export const cardLinkClass = (className?: string) =>
  cn(
    surface,
    'block transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out',
    'hover:border-line-strong hover:shadow-card-hover',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 focus-visible:ring-offset-2',
    className,
  );

type CardLinkProps = ComponentProps<typeof Link>;

export const CardLink = ({ className, ...props }: CardLinkProps) => (
  <Link className={cardLinkClass(className)} {...props} />
);
