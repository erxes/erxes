import React, { createContext } from 'react';

import { Table } from 'erxes-ui/components/table';
import { cn } from 'erxes-ui/lib/utils';
import { useRecordTable } from './RecordTableProvider';

/** The header cell id of the column a cell sits in, so its control is named by the column. */
export const CellColumnHead = createContext<string | undefined>(undefined);

/** A body cell. Its width and pinned offset are CSS variables the table container sets. */
export const RecordTableCell = ({
  ref,
  children,
  className,
  columnId,
  pinned,
  style,
  ...props
}: React.HTMLAttributes<HTMLTableCellElement> & {
  columnId: string;
  pinned: boolean;
} & React.RefAttributes<HTMLTableCellElement>) => {
  const { headId } = useRecordTable();

  return (
    <Table.Cell
      ref={ref}
      className={cn(
        'p-0 transition-colors isolate',
        pinned && [
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
        width: `var(--col-${columnId}-width)`,
        left: pinned ? `var(--col-${columnId}-start)` : undefined,
        ...style,
      }}
      {...props}
    >
      <CellColumnHead value={headId(columnId)}>{children}</CellColumnHead>
    </Table.Cell>
  );
};
