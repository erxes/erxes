import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'onHero';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const variants: Record<Variant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-strong',
  secondary: 'border border-line bg-white text-ink hover:bg-subtle',
  ghost: 'text-brand hover:bg-brand-soft',
  onHero: 'bg-white text-hero hover:bg-white/90',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
};

const buttonClass = (variant: Variant, size: Size, className?: string) =>
  cn(base, variants[variant], sizes[size], className);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  type = 'button',
  children,
  ...props
}: ButtonProps) => (
  <button
    type={type}
    className={buttonClass(variant, size, className)}
    {...props}
  >
    {children}
  </button>
);

type ButtonLinkProps = ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
};

export const ButtonLink = ({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonLinkProps) => (
  <Link className={buttonClass(variant, size, className)} {...props} />
);
