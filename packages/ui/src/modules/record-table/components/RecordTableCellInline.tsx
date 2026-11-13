import { Badge } from 'erxes-ui/components/badge';
import { Button } from 'erxes-ui/components/button';
import { Popover } from 'erxes-ui/components/popover';
import { cn } from 'erxes-ui/lib/utils';
import React from 'react';
import type { Popover as PopoverPrimitive } from 'radix-ui';

const RecordTableCellTrigger = React.forwardRef<
  React.ComponentRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ children, className, ...props }, ref) => {
  return (
    <Popover.Trigger asChild>
      <Button
        variant="ghost"
        className={cn(
          'h-8 px-2 w-full justify-start text-left rounded-none focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:shadow-subtle overflow-hidden',
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Button>
    </Popover.Trigger>
  );
});

const RecordTableCellContent = React.forwardRef<
  React.ComponentRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, ...props }, ref) => {
  return (
    <Popover.Content
      align="start"
      sideOffset={-32}
      disableTransition
      className={cn(
        'p-0 w-(--radix-popper-anchor-width) min-w-56 rounded',
        !className &&
          'has-[>input]:w-[var(--radix-popper-anchor-width)] has-[>input]:min-w-0 [&>input]:h-8 [&>input]:px-2',
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

RecordTableCellTrigger.displayName = 'RecordTableCellTrigger';

const RecordTableCellDisplay = React.forwardRef<
  React.ComponentRef<typeof Button>,
  React.ComponentPropsWithoutRef<typeof Button>
>(({ className, children, ...props }, ref) => {
  return (
    <Button
      variant="ghost"
      className={cn(
        'h-8 px-2 w-full justify-start text-left font-normal rounded-none overflow-hidden',
        className,
      )}
      ref={ref}
      asChild
      tabIndex={-1}
      {...props}
    >
      <div>{children}</div>
    </Button>
  );
});

RecordTableCellDisplay.displayName = 'RecordTableCellDisplay';

const RecordTableInlineAnchor = React.forwardRef<
  React.ComponentRef<typeof Badge>,
  React.ComponentPropsWithoutRef<typeof Badge>
>(({ className, onClick, children, ...props }, ref) => {
  return (
    <Badge
      ref={ref}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      variant="secondary"
      className={cn('min-w-32 group truncate', className)}
      {...props}
    >
      {children}
    </Badge>
  );
});

RecordTableInlineAnchor.displayName = 'RecordTableInlineAnchor';

export const RecordTableInlineCell = Object.assign(RecordTableCellDisplay, {
  Trigger: RecordTableCellTrigger,
  Content: RecordTableCellContent,
  Anchor: RecordTableInlineAnchor,
});
