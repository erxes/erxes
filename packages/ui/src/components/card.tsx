import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from 'erxes-ui/lib/utils';

const cardVariants = cva('bg-card text-card-foreground', {
  variants: {
    variant: {
      raised: 'rounded-xl shadow-sm',
      /** Flat with a rule around it: a record on a canvas or in a grid, which can be selected. */
      outline: 'rounded-lg border transition-colors',
    },
    /** The one the page is about: its rule and a ring in primary. */
    selected: { true: 'border-primary ring-2 ring-primary/30' },
    /** Not there yet, or turned off: a dashed rule. */
    dashed: { true: 'border-dashed' },
  },
  defaultVariants: { variant: 'raised' },
});

const CardRoot = ({
  ref,
  className,
  variant,
  selected,
  dashed,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cardVariants>) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, selected, dashed }), className)}
    {...props}
  />
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

/**
 * A raised panel with header, title, description, content and footer.
 * `variant="outline"` is flat with a rule, for a record on a canvas; `selected` and `dashed`
 * mark the one the page is about and one that is not there yet.
 */
export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Footer: CardFooter,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
});
