import { flexRender } from '@tanstack/react-table';
import { cn, RecordTable, Table } from 'erxes-ui';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

export const AccountingTableRow = ({
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
      rows[rowIndex - 1]?.original?.ptrId !== row.original.ptrId;

    return (
      <React.Fragment key={`row-group-${row.original._id}`}>
        {hasChangedPtrId ? (
          <RowComponent
            key={`${row.original.ptrId}_${rowIndex}`}
            id={`${row.original.ptrId}_${rowIndex}`}
            handleRowViewChange={(inView) =>
              handleRowViewChange?.(row.original._id, inView)
            }
          >
            <Table.Cell
              key={`${row.original.ptrId}_${rowIndex}_`}
              id={`${row.original.ptrId}_${rowIndex}_`}
              className={cn(rowIndex === 0 && 'border-t')}
            >
              <Link
                to={`/accounting/transaction/edit?parentId=${row.original.parentId}`}
              >
                <RecordTable.MoreButton className="w-full h-full" />
              </Link>
            </Table.Cell>
            <Table.Cell
              key={`${row.original.ptrId}_${rowIndex}__`}
              id={`${row.original.ptrId}_${rowIndex}__`}
              colSpan={row.getVisibleCells().length - 1}
              className={cn(
                rowIndex === 0 && 'border-t',
                row.original.ptrStatus === 'diff' && 'bg-red-50/25',
              )}
            >
              {`
                status: ${row.original.ptrStatus} | len: ${
                row.original.ptrInfo?.len ?? ''
              } | amount: ${
                row.original.ptrInfo?.value?.toLocaleString() ?? ''
              } ${
                row.original.ptrInfo?.diff
                  ? `| diff: ${row.original.ptrInfo?.diff.toLocaleString()}`
                  : ''
              }
              `}
            </Table.Cell>
          </RowComponent>
        ) : null}
        <RowComponent
          key={row.original._id}
          id={row.original._id}
          data-state={row.getIsSelected() && 'selected'}
          handleRowViewChange={(inView) =>
            handleRowViewChange?.(row.original._id, inView)
          }
        >
          {row.getVisibleCells().map((cell, cellIndex) => (
            <RecordTable.Cell cell={cell} key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </RecordTable.Cell>
          ))}
        </RowComponent>
      </React.Fragment>
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
