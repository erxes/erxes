import { useInView } from 'react-intersection-observer';

import { Table } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib/utils';

import React from 'react';
import { mergeRefs } from 'react-merge-refs';
import { useRecordTable } from './RecordTableProvider';
import { Row } from '@tanstack/react-table';

export const RecordTableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & {
    handleRowViewChange?: (inView: boolean) => void;
    original?: Row<any>['original'];
  }
>(({ children, className, handleRowViewChange, original, ...props }, ref) => {
  const { table } = useRecordTable();
  const { ref: inViewRef, inView } = useInView({
    onChange: handleRowViewChange,
  });

  return (
    <Table.Row
      {...props}
      ref={mergeRefs([ref, inViewRef])}
      className={cn('h-cell', inView ? 'in-view' : 'out-of-view', className)}
      id={original?.cursor}
    >
      {table.getRowModel().rows.length > 200 && !inView ? (
        <td
          className="h-cell bg-background"
          colSpan={table.getAllColumns().length}
        />
      ) : (
        children
      )}
    </Table.Row>
  );
});

RecordTableRow.displayName = 'RecordTableRow';
