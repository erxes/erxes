import type { ComponentProps, ReactNode } from 'react';
import { Table, cn } from 'erxes-ui';

type Align = 'left' | 'center' | 'right';

const ALIGN_CLASS: Record<Align, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

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

function ReportTableHeaderRow({
  className,
  ...props
}: ComponentProps<typeof Table.Row>) {
  return <Table.Row className={cn('bg-muted/50', className)} {...props} />;
}

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

function ReportTableEmpty({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border-2 border-dashed p-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

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
