import { flexRender } from '@tanstack/react-table';
import { cn, RecordTable, Table } from 'erxes-ui';
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

const PTR_STATUS_LABELS: Record<string, string> = {
  diff: 'Зөрүүтэй',
  ok: 'Тэнцсэн',
  acc: 'Дансны үлдэгдэл',
  unknown: 'Тодорхойгүй',
};

const formatAmount = (amount?: number) => (amount ?? 0).toLocaleString();

const getPinnedCellStyle = (column: any) => ({
  width: `calc(var(--col-${column.id}-size) * 1px)`,
  left:
    column.getIsPinned() === 'left'
      ? `${column.getStart('left')}px`
      : undefined,
});

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
    const visibleCells = row.getVisibleCells();
    const moreColumn = visibleCells.find(
      (cell) => cell.column.id === 'more',
    )?.column;
    const moreSize = moreColumn?.getSize() || 0;
    const accountColumn = visibleCells.find(
      (cell) => cell.column.id === 'account',
    )?.column;
    const ptrInfoLeft = accountColumn
      ? Math.max(accountColumn.getStart('left') - moreSize, 0)
      : 0;
    const ptrInfo = row.original.ptrInfo;
    const isDiff = row.original.ptrStatus === 'diff' || !!ptrInfo?.diff;
    const ptrStatus = ptrInfo?.status || row.original.ptrStatus;
    const ptrStatusLabel =
      PTR_STATUS_LABELS[ptrStatus || ''] || ptrStatus || 'Тодорхойгүй';

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
              className={cn(
                'sticky z-1 bg-background p-0 transition-colors',
                rowIndex === 0 && 'border-t',
              )}
              style={moreColumn ? getPinnedCellStyle(moreColumn) : undefined}
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
              colSpan={visibleCells.length - 1}
              className={cn(
                'bg-background py-1 transition-colors',
                rowIndex === 0 && 'border-t',
              )}
            >
              <div
                className="sticky z-1 flex w-fit max-w-[calc(100vw-5rem)] items-center gap-3 overflow-hidden whitespace-nowrap bg-inherit pl-2 text-sm"
                style={{
                  left: `${ptrInfoLeft}px`,
                }}
              >
                <span className="shrink-0 text-foreground">
                  {row.original.ptrNumber || 'Дугааргүй багц'}
                </span>
                <span
                  className={cn(
                    'shrink-0 text-muted-foreground',
                    isDiff && 'text-red-700',
                  )}
                >
                  Байдал: <b>{ptrStatusLabel}</b>
                </span>
                <span className="shrink-0 text-muted-foreground">
                  Баримт:{' '}
                  <b>
                    {ptrInfo?.len ?? 0} / {ptrInfo?.activeLen ?? 0}
                  </b>
                </span>
                <span className="shrink-0 text-muted-foreground">
                  Дүн: <b>{formatAmount(ptrInfo?.value)}</b>
                </span>
                {ptrInfo?.diff ? (
                  <span className="shrink-0 text-red-700">
                    Зөрүү: <b>{formatAmount(ptrInfo.diff)}</b>
                  </span>
                ) : null}
              </div>
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
