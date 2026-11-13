import React from 'react';

import { cn } from '../lib/utils';

const TableRoot = ({ ref, className, ...props }: React.ComponentProps<'table'>) => (
  <table
    ref={ref}
    className={cn(
      'w-full caption-bottom text-sm border-separate bg-sidebar table-fixed border-spacing-0',
      className,
    )}
    {...props}
  />
);

const TableHeader = ({ ref, className, ...props }: React.ComponentProps<'tbody'>) => (
  <thead ref={ref} className={cn(className)} {...props} />
);

const TableBody = ({ ref, className, ...props }: React.ComponentProps<'tbody'>) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0 border border-collapse rounded-lg', className)}
    {...props}
  />
);

const TableFooter = ({ ref, className, ...props }: React.ComponentProps<'tbody'>) => (
  <tfoot ref={ref} className={className} {...props} />
);

const TableRow = ({ ref, className, ...props }: React.ComponentProps<'tr'>) => (
  <tr
    ref={ref}
    className={cn(
      '[&>td]:border-b [&>td:first-child]:border-l transition-colors group/table-row hover:bg-muted',
      className,
    )}
    {...props}
  />
);

const TableHead = ({ ref, className, ...props }: React.ComponentProps<'th'>) => (
  <th
    ref={ref}
    className={cn(
      'h-9 px-2 text-left align-middle font-semibold text-xs text-accent-foreground *:[[role=checkbox]]:translate-y-[2px] border-spacing-0 font-mono uppercase bg-sidebar',
      className,
    )}
    {...props}
  />
);

const TableCell = ({ ref, className, ...props }: React.ComponentProps<'td'>) => (
  <td
    ref={ref}
    className={cn(
      'align-middle p-0 *:[[role=checkbox]]:translate-y-[2px] bg-background whitespace-nowrap h-cell border-r border-spacing-0 group-data-[state=selected]/table-row:bg-primary/10 group-hover/table-row:bg-muted',
      className,
    )}
    {...props}
  />
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
