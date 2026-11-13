import { Collapsible as CollapsiblePrimitive } from 'radix-ui';
import React from 'react';
import { Button } from 'erxes-ui/components/button';
import { cn } from 'erxes-ui/lib/utils';
import { IconCaretDownFilled } from '@tabler/icons-react';

const TriggerButton = ({ ref, className, ...props }: React.ComponentProps<typeof Button>) => {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger asChild ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className={cn('w-full justify-start text-accent-foreground group', className)}
        {...props}
      />
    </CollapsiblePrimitive.CollapsibleTrigger>
  );
};

const TriggerIcon = ({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof IconCaretDownFilled>) => {
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
};

export const Collapsible = Object.assign(CollapsiblePrimitive.Root, {
  Trigger: CollapsiblePrimitive.CollapsibleTrigger,
  TriggerIcon: TriggerIcon,
  TriggerButton: TriggerButton,
  Content: CollapsiblePrimitive.CollapsibleContent,
});
