import type { ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'erxes-ui/lib/utils';

// The report's table: its sizes are in em, so it grows and shrinks with the print size. Each
// part names itself in `data-slot` (`table`, `table-row`, `table-cell`, …), so code that reads
// a rendered report back (its totals, an Excel export) finds its parts.

/** The table itself. */
export const ReportTableRoot = ({ className, ...props }: ComponentProps<'table'>) => (
  <table
    data-slot="table"
    className={cn('w-full caption-bottom overflow-hidden', className)}
    {...props}
  />
);

const ReportTableHeader = ({ className, ...props }: ComponentProps<'thead'>) => (
  <thead data-slot="table-header" className={cn('[&_tr]:border', className)} {...props} />
);

const ReportTableBody = ({ className, ...props }: ComponentProps<'tbody'>) => (
  <tbody
    data-slot="table-body"
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
);

const ReportTableFooter = ({ className, ...props }: ComponentProps<'tfoot'>) => (
  <tfoot
    data-slot="table-footer"
    className={cn('border-t font-medium [&>tr]:last:border-b-0', className)}
    {...props}
  />
);

const reportRowVariants = cva('border transition-colors hover:bg-muted/50 data-selected:bg-muted', {
  variants: {
    variant: {
      default: '',
      /** A group over the rows it adds up: bold. */
      group: 'font-semibold',
      /** A top group: bold on a pale yellow ground. */
      highlight: 'bg-tint-highlight font-semibold',
      /** The totals line under the rows. */
      total: 'bg-muted/50',
      /** A line under a row that breaks it down (its amounts in a currency): muted, italic. */
      sub: 'bg-muted/40 italic',
    },
  },
  defaultVariants: { variant: 'default' },
});

const ReportTableRow = ({
  className,
  variant,
  ...props
}: ComponentProps<'tr'> & VariantProps<typeof reportRowVariants>) => (
  <tr data-slot="table-row" className={cn(reportRowVariants({ variant }), className)} {...props} />
);

const ReportTableHead = ({ className, ...props }: ComponentProps<'th'>) => (
  <th
    data-slot="table-head"
    className={cn('report-head border align-middle font-medium text-foreground', className)}
    {...props}
  />
);

const reportCellVariants = cva('border align-middle break-all whitespace-normal', {
  variants: {
    /** `none` for a cell that holds a table of its own (a row's breakdown). */
    inset: { default: 'report-cell', none: 'p-0' },
    /**
     * The text starts further in, by `--report-indent` in the cell's `style` (a group's level,
     * known when it renders).
     */
    indent: { false: '', true: 'pl-(--report-indent)' },
    /** `unused` greys a cell the row has no figure for (a debit row's credit). */
    tint: { none: '', unused: 'bg-foreground/10' },
  },
  defaultVariants: { inset: 'default', indent: false, tint: 'none' },
});

const ReportTableCell = ({
  className,
  inset,
  indent,
  tint,
  ...props
}: ComponentProps<'td'> & VariantProps<typeof reportCellVariants>) => (
  <td
    data-slot="table-cell"
    className={cn(reportCellVariants({ inset, indent, tint }), className)}
    {...props}
  />
);

const ReportTableCaption = ({ className, ...props }: ComponentProps<'caption'>) => (
  <caption
    data-slot="table-caption"
    className={cn('report-caption text-muted-foreground', className)}
    {...props}
  />
);

/** The report table's parts; `Report.tsx` loads them the first time a report table renders. */
export const ReportTableParts = Object.assign(ReportTableRoot, {
  Header: ReportTableHeader,
  Body: ReportTableBody,
  Footer: ReportTableFooter,
  Head: ReportTableHead,
  Row: ReportTableRow,
  Cell: ReportTableCell,
  Caption: ReportTableCaption,
});
