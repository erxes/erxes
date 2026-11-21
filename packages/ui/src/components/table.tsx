import React from 'react';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../lib/utils';

const tableVariants = cva(
  'w-full caption-bottom text-sm border-separate bg-sidebar table-fixed border-spacing-0',
  {
    variants: {
      variant: {
        default: '',
        // Cells hold controls rather than lines of text, so a row is exactly its cells' height.
        grid: 'leading-0',
        // A rounded panel; the body's corner cells round with it.
        card: 'rounded-lg p-1 [&>tbody>tr:first-child>td:first-child]:rounded-tl-lg [&>tbody>tr:first-child>td:last-child]:rounded-tr-lg [&>tbody>tr:last-child>td:first-child]:rounded-bl-lg [&>tbody>tr:last-child>td:last-child]:rounded-br-lg',
        // A rounded panel around square cells, which round where a cell's `corner` says
        // (3.x's inventory and fixed asset lines).
        frame: 'rounded-lg p-1 overflow-hidden',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

const TableRoot = ({
  ref,
  className,
  variant,
  ...props
}: React.ComponentProps<'table'> & VariantProps<typeof tableVariants>) => (
  <table ref={ref} className={cn(tableVariants({ variant }), className)} {...props} />
);

const TableHeader = ({ ref, className, ...props }: React.ComponentProps<'tbody'>) => (
  <thead ref={ref} className={cn(className)} {...props} />
);

const TableBody = ({ ref, className, ...props }: React.ComponentProps<'tbody'>) => (
  <tbody
    ref={ref}
    className={cn(
      // Rows draw the rule under them; the first row also draws the one under the header.
      '[&_tr:last-child]:border-0 border border-collapse rounded-lg [&>tr:first-child>td]:border-t',
      className,
    )}
    {...props}
  />
);

const TableFooter = ({ ref, className, ...props }: React.ComponentProps<'tbody'>) => (
  <tfoot ref={ref} className={className} {...props} />
);

const tableRowVariants = cva('[&>td]:border-b [&>td:first-child]:border-l transition-colors', {
  variants: {
    variant: {
      default: 'group/table-row hover:bg-muted',
      // A loading row: no hover, no column rules.
      placeholder: '[&>td]:border-r-0',
      // A row over the rows it groups (an asset over its locations): its cells on the panel's
      // ground.
      heading: 'group/table-row hover:bg-muted [&>td]:bg-sidebar',
      // A totals line under the rows: bold figures on the panel's ground, with no rules.
      total:
        'group/table-row hover:bg-transparent [&>td]:border-0 [&>td:first-child]:border-0 [&>td]:bg-transparent [&>td]:px-2 [&>td]:font-semibold [&>td]:tabular-nums',
    },
    /** The first row of a group (3.x's T-account rows of one voucher): a thick rule above it. */
    groupStart: { true: '[&>td]:border-t-4 [&>td]:border-t-muted' },
  },
  defaultVariants: { variant: 'default' },
});

const TableRow = ({
  ref,
  className,
  variant,
  groupStart,
  ...props
}: React.ComponentProps<'tr'> & VariantProps<typeof tableRowVariants>) => (
  <tr ref={ref} className={cn(tableRowVariants({ variant, groupStart }), className)} {...props} />
);

const TableHead = ({ ref, className, ...props }: React.ComponentProps<'th'>) => (
  <th
    ref={ref}
    className={cn(
      'h-9 px-2 text-left align-middle font-semibold text-xs text-accent-foreground *:[[role=checkbox]]:translate-y-0.5 border-spacing-0 font-mono uppercase bg-sidebar',
      className,
    )}
    {...props}
  />
);

/** `data-invalid` marks a cell whose input failed validation. */
const tableCellVariants = cva(
  'align-middle p-0 *:[[role=checkbox]]:translate-y-0.5 bg-background whitespace-nowrap h-cell border-r border-spacing-0 transition-colors data-invalid:border-l data-invalid:border-destructive',
  {
    variants: {
      pinned: {
        false: 'group-data-[state=selected]/table-row:bg-primary/10 group-hover/table-row:bg-muted',
        // Sticky over the cells scrolling under it: the cell stays opaque and the row's
        // hover and selection tint go on a layer beneath its content.
        true: 'sticky z-1 isolate before:absolute before:inset-0 before:-z-1 group-hover/table-row:before:bg-muted group-data-[state=selected]/table-row:before:bg-primary/10',
      },
      /** A ground that marks the cell; the row's hover still shows over it. */
      tint: {
        none: '',
        /** Its value is repeated in another row (3.x's product on two lines). */
        repeated: 'bg-tint-repeated',
        /** An option of its row is turned on. */
        highlight: 'bg-tint-highlight',
      },
      /** The corner it rounds, in a `frame` table: the first and last row's outer cells. */
      corner: {
        none: '',
        'top-start': 'rounded-tl-lg',
        'bottom-start': 'rounded-bl-lg',
        /** Both: the only row's first cell. */
        start: 'rounded-l-lg',
        'bottom-end': 'rounded-br-lg',
      },
      /** Padding: none by default, for a cell that holds a control. */
      inset: {
        none: '',
        /** Text beside the column rules. */
        x: 'px-2',
        /** A dense list's text cell. */
        sm: 'px-2 py-1',
        /** A checkbox on its own. */
        box: 'p-2',
        /** An empty table's message. */
        lg: 'py-8',
      },
      text: { default: '', sm: 'text-xs' },
      tone: { default: '', muted: 'text-muted-foreground' },
      /** Figures in columns: every digit the same width. */
      numeric: { false: '', true: 'tabular-nums' },
      /** `none` drops the rule on its right, as a loading row's cells. */
      rule: { default: '', none: 'border-r-0' },
    },
    defaultVariants: {
      pinned: false,
      tint: 'none',
      corner: 'none',
      inset: 'none',
      text: 'default',
      tone: 'default',
      numeric: false,
      rule: 'default',
    },
  },
);

/** The variant props of `Table.Cell`, which `RecordTable.Cell` passes on. */
export type TableCellVariants = VariantProps<typeof tableCellVariants>;

const TableCell = ({
  ref,
  className,
  pinned,
  tint,
  corner,
  inset,
  text,
  tone,
  numeric,
  rule,
  ...props
}: React.ComponentProps<'td'> & TableCellVariants) => (
  <td
    ref={ref}
    data-tint={tint && tint !== 'none' ? tint : undefined}
    className={cn(
      tableCellVariants({ pinned, tint, corner, inset, text, tone, numeric, rule }),
      className,
    )}
    {...props}
  />
);

const TableCaption = ({ ref, className, ...props }: React.ComponentProps<'caption'>) => (
  <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
);

/**
 * A plain styled HTML table, for small static grids of values.
 * A list of records uses `RecordTable`, not this.
 */
export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Head: TableHead,
  Row: TableRow,
  Cell: TableCell,
  Caption: TableCaption,
});
