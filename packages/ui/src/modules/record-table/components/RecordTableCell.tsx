// TanStack Table v8 hands out one mutable table, row and column object and changes what their
// getters return in place. Compiled, these reads would be cached on objects that never change,
// and selection, sizing and column order would stop showing. TanStack Table 9's store fixes this.
'use no memo';

import React from 'react';

import type { Cell } from '@tanstack/react-table';

import { Table } from 'erxes-ui/components/table';
import { cn } from 'erxes-ui/lib/utils';

export const RecordTableCell = ({
  ref,
  children,
  className,
  cell,
  style,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement> & {
  cell: Cell<unknown, unknown>;
} & React.RefAttributes<HTMLTableCellElement>) => {
  const { column } = cell;

  return (
    <Table.Cell
      ref={ref}
      className={cn(
        'p-0 transition-colors isolate',
        column.getIsPinned() && [
          'sticky z-1',
          'bg-background',
          'group-hover/table-row:bg-background',
          'group-data-[state=selected]/table-row:bg-background',
          'before:content-[""] before:absolute before:inset-0 before:-z-1',
          'group-hover/table-row:before:bg-muted',
          'group-data-[state=selected]/table-row:before:bg-primary/10',
        ],
        className,
      )}
      style={{
        width: `var(--col-${column.id}-width)`,
        left: column.getIsPinned() === 'left' ? `${column.getStart('left')}px` : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </Table.Cell>
  );
};
