import React, { useMemo } from 'react';
import { RecordTable } from 'erxes-ui';
import { flexRender } from '@tanstack/react-table';

export const TBalanceTableRow = ({
  handleRowViewChange,
  Row,
}: {
  handleRowViewChange?: (id: string, inView: boolean) => void;
  Row?: React.ComponentType<React.HTMLAttributes<HTMLTableRowElement>>;
}) => {
  const { table } = RecordTable.useRecordTable();
  const RowComponent = Row || RecordTable.Row;
  const rows = table.getRowModel().rows;

  const tableContent = rows.map((row, rowIndex) => {
    const hasChangedPtrId =
      rowIndex > 0 && rows[rowIndex - 1].original.ptrId !== row.original.ptrId;
    return (
      <RowComponent
        key={`${row.original._id}-${row.original.detail?._id}`}
        id={row.original._id}
        data-state={row.getIsSelected() && 'selected'}
        handleRowViewChange={(inView) =>
          handleRowViewChange?.(row.original._id, inView)
        }
      >
        {row.getVisibleCells().map((cell) => (
          <RecordTable.Cell
            cell={cell}
            key={cell.id}
            className={
              hasChangedPtrId ? 'border-t-4 border-t-muted' : undefined
            }
          >
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </RecordTable.Cell>
        ))}
      </RowComponent>
    );
  });

  const memoizedTableContent = useMemo(
    () => tableContent,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table.options.data, table.getState().columnOrder],
  );
  return table.getState().columnSizingInfo.isResizingColumn
    ? memoizedTableContent
    : tableContent;
};
