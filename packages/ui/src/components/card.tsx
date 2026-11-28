import React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'erxes-ui/lib/utils';

const cardVariants = cva('bg-card text-card-foreground shadow-sm', {
  variants: {
    variant: {
      default: 'rounded-xl',
      /** A small card in a grid of choices, inside a link: tighter corners, a ground on hover. */
      tile: 'rounded-lg hover:bg-accent',
    },
  },
  defaultVariants: { variant: 'default' },
});

const CardRoot = ({
  ref,
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardVariants>) => (
  <div ref={ref} className={cn(cardVariants({ variant }), className)} {...props} />
);

const CardHeader = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <div ref={ref} className={cn('flex flex-col text-xl space-y-1.5 p-6', className)} {...props} />
);

const CardTitle = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <div
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight text-xl', className)}
    {...props}
  />
);

const CardDescription = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <div
    ref={ref}
    className={cn('text-sm text-muted-foreground font-medium', className)}
    {...props}
  />
);

const CardContent = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
);

const CardFooter = ({ ref, className, ...props }: React.ComponentProps<'div'>) => (
  <div ref={ref} className={cn('flex items-center p-6 pt-0', className)} {...props} />
);

/** A raised panel with header, title, description, content and footer. */
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Footer: CardFooter,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
});
