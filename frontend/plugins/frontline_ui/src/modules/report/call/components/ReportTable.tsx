import type { ComponentProps, ReactNode } from 'react';
import { Table, cn } from 'erxes-ui';

type Align = 'left' | 'center' | 'right';

const ALIGN_CLASS: Record<Align, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

/**
 * Shared density wrapper for the report tables.
 *
 * `erxes-ui`'s `Table` is tuned for the record grids: it lays out `table-fixed`
 * so every column gets an equal share of the width, and its cells carry `p-0`
 * while its heads carry `px-2`. In a seven- or eight-column report that squeezes
 * the label column to the same width as a two-digit count and leaves the text
 * touching the cell borders, with headers offset from the values beneath them.
 *
 * These wrappers restore content-driven column widths, symmetric padding on
 * heads and cells, and a horizontal scroll container so a narrow viewport
 * scrolls the table instead of crushing it. `Table.Cell`'s `h-cell` stays as the
 * row's minimum height — a table cell treats `height` as a floor, so the padding
 * here grows the row past it.
 */
function ReportTableRoot({
  className,
  children,
  ...props
}: ComponentProps<typeof Table>) {
  return (
    <div
      className="overflow-x-auto rounded-xl border styled-scroll"
      style={{ boxShadow: 'var(--shadow-card)' }}
    >
      <Table className={cn('table-auto min-w-max', className)} {...props}>
        {children}
      </Table>
    </div>
  );
}

function ReportTableHead({
  align = 'left',
  className,
  ...props
}: ComponentProps<typeof Table.Head> & { align?: Align }) {
  return (
    <Table.Head
      className={cn(
        'h-10 px-4 whitespace-nowrap',
        ALIGN_CLASS[align],
        className,
      )}
      {...props}
    />
  );
}

function ReportTableCell({
  align = 'left',
  numeric,
  className,
  ...props
}: ComponentProps<typeof Table.Cell> & {
  align?: Align;
  /** Renders the value with tabular figures so digits line up down the column. */
  numeric?: boolean;
}) {
  return (
    <Table.Cell
      className={cn(
        'px-4 py-3 align-middle',
        numeric && 'tabular-nums',
        ALIGN_CLASS[align],
        className,
      )}
      {...props}
    />
  );
}

/** Header row with the shared tint, so every report table reads the same. */
function ReportTableHeaderRow({
  className,
  ...props
}: ComponentProps<typeof Table.Row>) {
  return <Table.Row className={cn('bg-muted/50', className)} {...props} />;
}

/** Body row with zebra striping driven by its index. */
function ReportTableBodyRow({
  index,
  className,
  ...props
}: ComponentProps<typeof Table.Row> & { index?: number }) {
  return (
    <Table.Row
      className={cn(
        'hover:bg-muted/30',
        index !== undefined && index % 2 !== 0 && 'bg-muted/10',
        className,
      )}
      {...props}
    />
  );
}

/** Shared empty state for a report table that has no rows to show. */
function ReportTableEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-dashed p-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

/**
 * Numeric count rendered as a tinted pill, sized to a common minimum so the
 * pills stay aligned down the column.
 *
 * Tones name the theme's own semantic colours. The `--pos` / `--neg` / `--warn`
 * variables used elsewhere in the call report are defined nowhere in the
 * stylesheet, so those pills render untinted — use these tones instead.
 */
function ReportTableBadge({
  tone,
  children,
}: {
  tone: 'success' | 'destructive' | 'warning';
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex min-w-10 items-center justify-center rounded-md px-2 py-0.5 text-xs font-semibold tabular-nums',
        tone === 'success' && 'bg-success/10 text-success',
        tone === 'destructive' && 'bg-destructive/10 text-destructive',
        tone === 'warning' && 'bg-warning/10 text-warning',
      )}
    >
      {children}
    </span>
  );
}

export const ReportTable = Object.assign(ReportTableRoot, {
  Header: Table.Header,
  Body: Table.Body,
  HeaderRow: ReportTableHeaderRow,
  Row: ReportTableBodyRow,
  Head: ReportTableHead,
  Cell: ReportTableCell,
  Badge: ReportTableBadge,
  Empty: ReportTableEmpty,
});
