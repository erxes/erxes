import * as React from 'react';
import { Popover as PopoverPrimitive } from 'radix-ui';
import { cn } from 'erxes-ui/lib/utils';

export type PopoverProps = React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>;

const popoverClassName =
  'z-50 w-72 rounded-md bg-background p-4 shadow-lg outline-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0';

const PopoverPortal = ({
  ...props
}: React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Portal>) => (
  <PopoverPrimitive.Portal {...props} />
);

const PopoverContent = ({
  ref,
  className,
  align = 'center',
  disableTransition,
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content> & {
  disableTransition?: boolean;
}) => (
  <PopoverPortal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        popoverClassName,
        !disableTransition &&
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className,
      )}
      {...props}
    />
  </PopoverPortal>
);

export const Popover = Object.assign(PopoverPrimitive.Root, {
  Trigger: PopoverPrimitive.Trigger,
  Content: PopoverContent,
  Anchor: PopoverPrimitive.Anchor,
  Close: PopoverPrimitive.Close,
});
