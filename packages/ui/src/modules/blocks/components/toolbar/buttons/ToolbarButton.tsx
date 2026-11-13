import type { ComponentPropsWithoutRef, ComponentRef } from 'react';
import { forwardRef } from 'react';
import { Button } from 'erxes-ui/components/button';
import { cn } from 'erxes-ui/lib/utils';

export const ToolbarButton = forwardRef<
  ComponentRef<typeof Button>,
  ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    className={cn(
      'transition-none enabled:pointer-events-auto',
      'hover:bg-(--color-primary)/15! hover:text-(--color-primary)!',
      'data-[state=open]:bg-(--color-primary)/10! data-[state=open]:text-(--color-primary)!',
      className,
    )}
    {...props}
  />
));

ToolbarButton.displayName = 'ToolbarButton';
