import Link from 'next/link';
import type { ButtonHTMLAttributes, ComponentProps, ReactNode } from 'react';
import { cn } from '@/modules/ui/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'onHero' | 'onHeroSoft';
type Size = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-[background-color,color,border-color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2';

const variants: Record<Variant, string> = {
  primary:
    'bg-brand text-white hover:bg-brand-strong focus-visible:ring-brand/40',
  secondary:
    'border border-line bg-white text-ink hover:bg-subtle focus-visible:ring-brand/40',
  ghost: 'text-brand hover:bg-brand-soft focus-visible:ring-brand/40',
  onHero:
    'bg-white text-hero shadow-lg shadow-black/25 hover:-translate-y-px hover:bg-white hover:shadow-xl hover:shadow-black/30 focus-visible:ring-white/70',
  onHeroSoft:
    'border border-white/15 bg-white/[0.07] text-white/90 backdrop-blur-sm hover:-translate-y-px hover:border-white/30 hover:bg-white/15 hover:text-white focus-visible:ring-white/70',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-[15px]',
};

export const buttonClass = ({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}) => cn(base, variants[variant], sizes[size], className);

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
    className={buttonClass({ variant, size, className })}
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
  <Link className={buttonClass({ variant, size, className })} {...props} />
);
