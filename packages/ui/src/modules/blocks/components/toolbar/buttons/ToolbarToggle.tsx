import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';
import { Toggle } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';

export const ToolbarToggle = forwardRef<
  ElementRef<typeof Toggle>,
  ComponentPropsWithoutRef<typeof Toggle>
>(({ className, ...props }, ref) => (
  <Toggle
    ref={ref}
    className={cn(
      'transition-none enabled:pointer-events-auto',
      'hover:bg-(--color-primary)/15! hover:text-(--color-primary)!',
      'active:bg-(--color-primary)/15! data-[state=on]:bg-(--color-primary)/10! data-[state=on]:text-(--color-primary)!',
      className,
    )}
    {...props}
  />
));

ToolbarToggle.displayName = 'ToolbarToggle';
