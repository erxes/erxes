import { Badge } from 'erxes-ui/components/badge';
import { Button, buttonVariants } from 'erxes-ui/components/button';
import { Popover, type PopoverContentProps } from 'erxes-ui/components/popover';
import { cn } from 'erxes-ui/lib/utils';
import React, { use, useId } from 'react';
import { CellColumnHead } from './RecordTableCell';

const RecordTableCellTrigger = ({
  ref,
  children,
  className,
  id,
  ...props
}: React.ComponentProps<typeof Button>) => {
  const ownId = useId();
  const triggerId = id ?? ownId;
  // In a table, the column then the value ("Emails ada@…"); an empty cell is still named.
  const columnHead = use(CellColumnHead);

  return (
    <Popover.Trigger
      render={
        <Button
          id={triggerId}
          aria-labelledby={columnHead ? `${columnHead} ${triggerId}` : undefined}
          variant="cell"
          className={cn('h-8 w-full justify-start text-left overflow-hidden', className)}
          ref={ref}
          {...props}
        />
      }
    >
      {children}
    </Popover.Trigger>
  );
};

const RecordTableCellContent = ({ className, ...props }: PopoverContentProps) => {
  return (
    <Popover.Content
      align="start"
      sideOffset={-32}
      disableTransition
      className={cn(
        'p-0 w-(--anchor-width) min-w-56 rounded',
        !className &&
          'has-[>input]:w-[var(--anchor-width)] has-[>input]:min-w-0 [&>input]:h-8 [&>input]:px-2',
        className,
      )}
      {...props}
    />
  );
};

const RecordTableCellDisplay = ({ className, ...props }: React.ComponentProps<'div'>) => (
  <div
    className={cn(
      buttonVariants({ variant: 'ghost' }),
      'h-8 px-2 w-full justify-start text-left font-normal rounded-none overflow-hidden',
      className,
    )}
    tabIndex={-1}
    {...props}
  />
);

const RecordTableInlineAnchor = ({
  ref,
  className,
  onClick,
  children,
  ...props
}: React.ComponentProps<typeof Badge>) => {
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
};

export const RecordTableInlineCell = Object.assign(RecordTableCellDisplay, {
  Trigger: RecordTableCellTrigger,
  Content: RecordTableCellContent,
  Anchor: RecordTableInlineAnchor,
});
