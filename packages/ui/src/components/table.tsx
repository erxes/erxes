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
    },
  },
  defaultVariants: { variant: 'default' },
});

const TableRow = ({
  ref,
  className,
  variant,
  ...props
}: React.ComponentProps<'tr'> & VariantProps<typeof tableRowVariants>) => (
  <tr ref={ref} className={cn(tableRowVariants({ variant }), className)} {...props} />
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
    },
    defaultVariants: { pinned: false },
  },
);

const TableCell = ({
  ref,
  className,
  pinned,
  ...props
}: React.ComponentProps<'td'> & VariantProps<typeof tableCellVariants>) => (
  <td ref={ref} className={cn(tableCellVariants({ pinned }), className)} {...props} />
);

const TableCaption = ({ ref, className, ...props }: React.ComponentProps<'caption'>) => (
  <caption ref={ref} className={cn('mt-4 text-sm text-muted-foreground', className)} {...props} />
);

export const Table = Object.assign(TableRoot, {
  Header: TableHeader,
  Body: TableBody,
  Footer: TableFooter,
  Head: TableHead,
  Row: TableRow,
  Cell: TableCell,
  Caption: TableCaption,
});
