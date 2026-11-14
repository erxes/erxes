import React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

// Base UI controls mark themselves data-disabled, so a label after one dims on that.
const labelVariants = cva(
  'leading-none inline-block peer-disabled:cursor-not-allowed peer-disabled:opacity-70 peer-data-disabled:cursor-not-allowed peer-data-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'font-mono uppercase font-semibold text-xs text-accent-foreground',
        // Beside a switch or checkbox: the default label at regular weight.
        option: 'font-mono uppercase text-xs text-accent-foreground',
        // A sentence-case label above a field, as on the sign-in forms.
        plain: 'text-sm font-medium text-foreground',
        // A field name beside its value, with an optional icon before it.
        muted: 'gap-1.5 text-xs font-medium text-accent-foreground',
        peer: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

/** A native label: Base UI has no label primitive. */
export const Label = ({
  className,
  variant,
  htmlFor,
  ...props
}: React.ComponentProps<'label'> & VariantProps<typeof labelVariants>) => (
  <label htmlFor={htmlFor} className={cn(labelVariants({ variant }), className)} {...props} />
);
