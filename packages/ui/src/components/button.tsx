import type React from 'react';
import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from 'erxes-ui/lib/utils';

const variants = cva(
  'inline-flex items-center justify-center gap-2 px-3 whitespace-nowrap rounded text-sm transition-colors outline-offset-2 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-ring/70 disabled:pointer-events-none disabled:opacity-50 [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0 font-medium cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'border-primary border relative transition duration-300 ease-in-out before:duration-300 before:ease-in-out before:transition-opacity rounded shadow-button-primary before:pointer-events-none before:absolute before:inset-0 before:rounded before:bg-linear-to-b before:from-white/20 before:opacity-50 hover:before:opacity-100 bg-primary text-primary-foreground after:pointer-events-none after:absolute after:inset-0 after:bg-white/10 after:bottom-1/2 after:rounded after:mix-blend-overlay text-shadow-xs/25',
        destructive:
          'border-destructive border relative transition duration-300 ease-in-out before:duration-300 before:ease-in-out before:transition-opacity rounded shadow-button-primary before:pointer-events-none before:absolute before:inset-0 before:rounded before:bg-linear-to-b before:from-white/20 before:opacity-50 hover:before:opacity-100 bg-destructive text-destructive-foreground after:pointer-events-none after:absolute after:inset-0 after:bg-white/10 after:bottom-1/2 after:rounded after:mix-blend-overlay text-shadow-xs/25',
        outline: 'shadow-sm bg-background shadow-button-outline hover:bg-accent',
        secondary: 'bg-accent text-foreground hover:bg-border',
        ghost: 'hover:bg-accent-foreground/10',
        link: 'bg-background shadow-button-outline hover:bg-accent text-primary-text',
      },
      size: {
        default: 'h-7 py-1',
        sm: 'h-6 rounded text-xs after:rounded-xs after:absolute px-2 gap-1',
        lg: 'h-8 rounded font-semibold',
        icon: 'h-7 w-7',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

/**
 * The size variants override the base padding, gap and text size, so the classes go through
 * tailwind-merge. Without it a link styled as a small button gets whichever rule the CSS
 * happens to list last.
 */
export const buttonVariants = (props?: Parameters<typeof variants>[0]) => cn(variants(props));

export type ButtonProps = React.ComponentProps<typeof ButtonPrimitive> &
  VariantProps<typeof buttonVariants>;

/** A native button by default. Links styled as buttons put `buttonVariants` on the link instead. */
export const Button = ({ className, variant, size, ...props }: ButtonProps) => (
  <ButtonPrimitive className={buttonVariants({ variant, size, className })} {...props} />
);
