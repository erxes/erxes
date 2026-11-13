import React, { useRef } from 'react';
import { Popover as PopoverPrimitive } from '@base-ui/react/popover';
import { cn } from '../lib/utils';
import { Button, buttonVariants } from './button';
import { IconX } from '@tabler/icons-react';

type CommandBarProps = React.PropsWithChildren<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
  disableAutoFocus?: boolean;
}>;

const Root = ({
  open = false,
  onOpenChange,
  defaultOpen = false,
  disableAutoFocus = true,
  children,
}: CommandBarProps) => {
  // Where the bar opens from. The page opens it, so it is an anchor, not a trigger.
  const anchor = useRef<HTMLDivElement>(null);

  return (
    <PopoverPrimitive.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
      <div ref={anchor} className="fixed bottom-10 left-1/2 h-px w-px -translate-x-1/2 z-50" />
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Positioner
          anchor={anchor}
          side="top"
          sideOffset={0}
          collisionPadding={0}
          className="isolate z-50"
        >
          <PopoverPrimitive.Popup
            initialFocus={!disableAutoFocus}
            className="data-open:animate-in data-closed:animate-out data-closed:fade-out-0 data-open:fade-in-0 data-closed:zoom-out-95 data-open:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
          >
            {children}
          </PopoverPrimitive.Popup>
        </PopoverPrimitive.Positioner>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};

const Value = ({
  ref,
  className,
  onClose,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  onClose?: () => void;
}) => {
  return (
    <div className="flex items-center -space-x-px">
      <div
        ref={ref}
        className={cn(
          buttonVariants({ variant: 'outline' }),
          'shadow-none border-dashed border',
          onClose && 'rounded-r-none',
          className,
        )}
        {...props}
      >
        {children}
      </div>
      {onClose && (
        <Button
          variant="outline"
          className="shadow-none border-dashed border rounded-l-none"
          size="icon"
          onClick={onClose}
        >
          <IconX />
        </Button>
      )}
    </div>
  );
};

const Bar = ({ ref, className, ...props }: React.ComponentProps<'div'>) => {
  return (
    <div
      ref={ref}
      className={cn(
        'relative flex items-center overflow-hidden rounded-lg p-1 shadow-focus bg-background gap-x-1',
        className,
      )}
      {...props}
    />
  );
};

export const CommandBar = Object.assign(Root, {
  Value,
  Bar,
});
