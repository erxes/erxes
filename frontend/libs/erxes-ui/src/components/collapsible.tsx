import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import React from 'react';
import { Button } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import { IconCaretDownFilled } from '@tabler/icons-react';
export const TriggerButton = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, ...props }, ref) => {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger asChild ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          'w-full justify-start text-accent-foreground group',
          className,
        )}
        {...props}
      />
    </CollapsiblePrimitive.CollapsibleTrigger>
  );
});

export const TriggerIcon = React.forwardRef<
  React.ElementRef<typeof IconCaretDownFilled>,
  React.ComponentPropsWithoutRef<typeof IconCaretDownFilled>
>(({ className, ...props }, ref) => {
  return (
    <IconCaretDownFilled
      className={cn(
        'transition-transform duration-100 group-data-[state=closed]:-rotate-90',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

export const Collapsible = Object.assign(CollapsiblePrimitive.Root, {
  Trigger: CollapsiblePrimitive.CollapsibleTrigger,
  TriggerIcon: TriggerIcon,
  TriggerButton: TriggerButton,
  Content: CollapsiblePrimitive.CollapsibleContent,
});
