import React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { fieldTextVariants } from './input';
import { cn } from 'erxes-ui/lib/utils';

const textareaVariants = cva(
  'flex min-h-[60px] w-full rounded bg-transparent px-3 py-1.5 text-sm shadow-xs transition-[color,box-shadow] placeholder:text-accent-foreground focus-visible:outline-hidden focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: '',
        // No border; the focus ring still shows.
        flat: 'rounded-sm shadow-none',
        // No border and no focus ring: the box around it draws both.
        ghost: 'py-2 shadow-none focus-visible:shadow-none',
      },
      text: fieldTextVariants,
      // One line, cut with an ellipsis, as a collapsed composer shows its hint.
      truncate: { true: 'overflow-hidden text-ellipsis whitespace-nowrap' },
    },
    defaultVariants: { variant: 'default', text: 'default' },
  },
);

export const Textarea = ({
  ref,
  className,
  variant,
  text,
  truncate,
  ...props
}: React.ComponentProps<'textarea'> & VariantProps<typeof textareaVariants>) => {
  return (
    <textarea
      className={cn(textareaVariants({ variant, text, truncate }), className)}
      ref={ref}
      {...props}
    />
  );
};
