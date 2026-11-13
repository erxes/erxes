import React from 'react';
import { Separator as SeparatorPrimitive } from 'radix-ui';
import { cn } from '../lib/utils';

const SeparatorRoot = ({
  ref,
  className,
  orientation = 'horizontal',
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative={decorative}
    orientation={orientation}
    className={cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
      className,
    )}
    {...props}
  />
);

const SeparatorInline = ({
  ref,
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) => {
  return (
    <SeparatorPrimitive.Root
      ref={ref}
      className={cn(
        'inline-block bg-border rounded-lg flex-none',
        orientation === 'horizontal' ? 'w-3 h-0.5' : 'w-0.5 h-3',
        className,
      )}
      {...props}
    />
  );
};

export const Separator = Object.assign(SeparatorRoot, {
  Inline: SeparatorInline,
});
