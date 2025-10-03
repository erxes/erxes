import * as React from 'react';

import { cn } from 'erxes-ui/lib';

/**
 * This component is based on the `kbd` element and supports all of its props
 */
export const Kbd = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<'kbd'> & {
    variant?: 'background' | 'foreground';
  }
>(({ children, className, variant = 'background', ...props }, ref) => {
  return (
    <kbd
      {...props}
      ref={ref}
      className={cn(
        'opacity-70 inline-flex h-5 w-fit min-w-[20px] items-center justify-center rounded-md border px-1',
        'text-xs',
        variant === 'background' && 'bg-background/10 border-background/20',
        variant === 'foreground' && 'bg-foreground/10 border-foreground/20',
        className,
      )}
    >
      {children}
    </kbd>
  );
});
Kbd.displayName = 'Kbd';
