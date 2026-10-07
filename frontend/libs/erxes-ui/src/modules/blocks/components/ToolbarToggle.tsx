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
      'transition-none active:bg-primary/30 data-[state=on]:bg-primary/20 data-[state=on]:text-primary data-[state=on]:ring-1 data-[state=on]:ring-primary/40 data-[state=on]:ring-inset',
      className,
    )}
    {...props}
  />
));

ToolbarToggle.displayName = 'ToolbarToggle';
