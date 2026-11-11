import * as React from 'react';
import { Separator as SeparatorPrimitive } from 'radix-ui';
import { cn } from '../lib/utils';

const SeparatorRoot = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(
  (
    { className, orientation = 'horizontal', decorative = true, ...props },
    ref,
  ) => (
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
  ),
);

SeparatorRoot.displayName = SeparatorPrimitive.Root.displayName;

const SeparatorInline = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = 'vertical', ...props }, ref) => {
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
});

SeparatorInline.displayName = 'Separator.Inline';

export const Separator = Object.assign(SeparatorRoot, {
  Inline: SeparatorInline,
});
