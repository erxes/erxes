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
      'transition-none hover:bg-primary/15! hover:text-primary! active:bg-primary/15! data-[state=on]:bg-primary/10! data-[state=on]:text-primary!',
      className,
    )}
    {...props}
  />
));

ToolbarToggle.displayName = 'ToolbarToggle';
