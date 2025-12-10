import * as React from 'react';

import { cn } from 'erxes-ui/lib/utils';

function ReportTableRoot({
  className,
  ...props
}: React.ComponentProps<'table'>) {
  return (
    <table
      data-slot="table"
      className={cn(
        'w-full overflow-hidden caption-bottom text-[1em]',
        className,
      )}
      {...props}
    />
  );
}

function ReportTableHeader({
  className,
  ...props
}: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('[&_tr]:border', className)}
      {...props}
    />
  );
}

function ReportTableBody({
  className,
  ...props
}: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function ReportTableFooter({
  className,
  ...props
}: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'border-t font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  );
}

function ReportTableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'hover:bg-muted/50 data-[state=selected]:bg-muted border transition-colors',
        className,
      )}
      {...props}
    />
  );
}

function ReportTableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'text-foreground h-[2.5em] px-[0.5em] text-middle align-middle font-medium border',
        className,
      )}
      {...props}
    />
  );
}

function ReportTableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'p-[0.33em] align-middle border text-[1em] whitespace-normal break-all',
        className,
      )}
      {...props}
    />
  );
}

function ReportTableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('text-muted-foreground mt-[1em] text-[1em]', className)}
      {...props}
    />
  );
}

export const ReportTable = Object.assign(ReportTableRoot, {
  Header: ReportTableHeader,
  Body: ReportTableBody,
  Footer: ReportTableFooter,
  Head: ReportTableHead,
  Row: ReportTableRow,
  Cell: ReportTableCell,
  Caption: ReportTableCaption,
});
