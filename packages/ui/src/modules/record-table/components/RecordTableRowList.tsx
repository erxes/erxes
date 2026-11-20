import { useState, type ComponentProps, type ComponentType } from 'react';
import { flexRender } from '@tanstack/react-table';
import { cn } from 'erxes-ui/lib/utils';
import { useRowWindow } from '../hooks/useRowWindow';
import { RecordTableCell } from './RecordTableCell';
import { useRecordTableViewport } from './RecordTableCursor';
import { useRecordTable } from './RecordTableProvider';
import { RecordTableRow } from './RecordTableRow';

/** Past this many rows, a cursor-paged table renders only the rows near its viewport. */
const WINDOW_AFTER = 100;

/** Stands in for `rows` rows that are not rendered, so the scroll height stays the same. */
const RowsGap = ({
  ref,
  rows,
  columnCount,
}: {
  rows: number;
  columnCount: number;
} & React.RefAttributes<HTMLTableRowElement>) => (
  <tr
    ref={ref}
    aria-hidden
    className="h-(--gap-height)"
    style={{ '--gap-height': `calc(var(--spacing-cell) * ${rows})` }}
  >
    <td aria-hidden colSpan={columnCount} className="border-0! p-0" />
  </tr>
);

/**
 * The rows, rendered again when the data or the column order, visibility or pinning changes.
 * The leaf headers keep their identity while a column is resized (only CSS variables change
 * then), so resizing renders no rows. Selection re-renders only the rows it touches. In a
 * `RecordTable.CursorProvider` with more than `WINDOW_AFTER` rows, only the rows near the
 * viewport render, so a long list keeps a small page.
 */
export const RecordTableRowList = ({
  handleRowViewChange,
  Row = RecordTableRow,
}: {
  handleRowViewChange?: (id: string, inView: boolean) => void;
  Row?: ComponentType<ComponentProps<typeof RecordTableRow>>;
}) => {
  const { table } = useRecordTable();
  const { rows } = table.getRowModel();
  const leafHeaders = table.getHeaderGroups().at(-1)?.headers ?? [];
  const viewport = useRecordTableViewport();
  const windowed = rows.length > WINDOW_AFTER && viewport !== null;
  const [listStart, setListStart] = useState<HTMLTableRowElement | null>(null);

  const { start, end } = useRowWindow({
    count: rows.length,
    viewport: windowed ? viewport : null,
    listStart,
  });

  return (
    <>
      {windowed && <RowsGap ref={setListStart} rows={start} columnCount={leafHeaders.length} />}
      {rows.slice(start, end).map((row, sliceIndex) => {
        const cells = row.getAllCellsByColumnId();

        return (
          <Row
            key={row.id}
            rowId={row.id}
            original={row.original}
            handleRowViewChange={
              handleRowViewChange && ((inView) => handleRowViewChange(row.id, inView))
            }
          >
            {leafHeaders.map(({ column }) => {
              const cell = cells[column.id];

              return (
                cell && (
                  <RecordTableCell
                    key={cell.id}
                    columnId={column.id}
                    pinned={column.getIsPinned() === 'start'}
                    className={cn(start + sliceIndex === 0 && 'border-t')}
                  >
                    {flexRender(column.columnDef.cell, cell.getContext())}
                  </RecordTableCell>
                )
              );
            })}
          </Row>
        );
      })}
      {windowed && <RowsGap rows={rows.length - end} columnCount={leafHeaders.length} />}
    </>
  );
};
