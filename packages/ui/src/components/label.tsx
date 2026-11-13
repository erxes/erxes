import React from 'react';

import { Label as LabelPrimitive } from 'radix-ui';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../lib/utils';

const labelVariants = cva(
  'leading-none inline-block peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  {
    variants: {
      variant: {
        default: 'font-mono uppercase font-semibold text-xs text-accent-foreground ',
        peer: '',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export const Label = ({
  ref,
  className,
  variant,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>) => (
  <LabelPrimitive.Root ref={ref} className={cn(labelVariants({ variant }), className)} {...props} />
);
