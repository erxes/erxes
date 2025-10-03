import React from 'react';

import { Cell } from '@tanstack/react-table';

import { Table } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib/utils';

export const RecordTableCell = React.forwardRef<
  HTMLTableCellElement,
  React.HTMLAttributes<HTMLTableCellElement> & { cell: Cell<any, unknown> }
>(({ children, className, cell, style, ...props }, ref) => {
  const { column } = cell;

  return (
    <Table.Cell
      ref={ref}
      className={cn(
        'p-0 transition-colors isolate',
        column.getIsPinned() === 'left' && 'sticky z-[1]',
        column.getIsPinned() === 'right' && 'sticky z-[1]',
        className,
      )}
      style={{
        width: `calc(var(--col-${column.id}-size) * 1px)`,
        left:
          column.getIsPinned() === 'left'
            ? `${column.getStart('left')}px`
            : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </Table.Cell>
  );
});
