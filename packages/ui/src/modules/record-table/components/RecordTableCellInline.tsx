import { Badge } from 'erxes-ui/components/badge';
import { Button, buttonVariants } from 'erxes-ui/components/button';
import { Popover, type PopoverContentProps } from 'erxes-ui/components/popover';
import { cn } from 'erxes-ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import type React from 'react';
import { CellColumnHead, useCellLabel } from './RecordTableCell';

const cellTriggerVariants = cva(
  'h-8 px-2 w-full justify-start text-left focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:shadow-subtle overflow-hidden',
  {
    variants: {
      variant: {
        // A record table cell.
        cell: 'rounded-none',
        // A value beside its label in a side panel: rounded on hover, regular weight.
        field: 'rounded-sm font-normal',
        // The record's name at the top of a side panel.
        title: 'rounded-sm px-1',
        // A standalone field: the drop shadow of an input.
        input: 'rounded-sm shadow-xs',
      },
      // Shows a placeholder, not a value.
      empty: { true: 'text-muted-foreground' },
    },
    defaultVariants: { variant: 'cell' },
  },
);

type RecordTableCellTriggerProps = Omit<React.ComponentProps<typeof Button>, 'variant'> &
  VariantProps<typeof cellTriggerVariants>;

const RecordTableCellTrigger = ({
  ref,
  children,
  className,
  id,
  variant,
  empty,
  ...props
}: RecordTableCellTriggerProps) => {
  const label = useCellLabel(id);

  return (
    <Popover.Trigger
      render={
        <Button
          {...label}
          variant="ghost"
          className={cn(cellTriggerVariants({ variant, empty }), className)}
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
      variant="flush"
      className={cn(
        'w-(--anchor-width) min-w-56',
        !className &&
          'has-[>input]:w-(--anchor-width) has-[>input]:min-w-0 [&>input]:h-8 [&>input]:px-2',
        className,
      )}
      {...props}
    />
  );
};

const cellDisplayVariants = cva(
  'h-8 px-2 w-full justify-start text-left font-normal rounded-none overflow-hidden',
  {
    variants: {
      variant: {
        default: '',
        // Secondary detail, such as when a row last changed.
        muted: 'text-xs font-medium text-muted-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

const RecordTableCellDisplay = ({
  className,
  variant,
  ...props
}: React.ComponentProps<'div'> & VariantProps<typeof cellDisplayVariants>) => (
  <div
    className={cn(
      buttonVariants({ variant: 'ghost' }),
      cellDisplayVariants({ variant }),
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
      className={cn('min-w-32 group overflow-hidden', className)}
      {...props}
    >
      {children}
    </Badge>
  );
};

export const RecordTableInlineCell = Object.assign(RecordTableCellDisplay, {
  /** Names the triggers inside by the element with this id, as the column head does in a table. */
  LabelledBy: CellColumnHead,
  Trigger: RecordTableCellTrigger,
  Content: RecordTableCellContent,
  Anchor: RecordTableInlineAnchor,
});
