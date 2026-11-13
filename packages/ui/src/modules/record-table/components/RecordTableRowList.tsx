import type { ComponentProps, ComponentType } from 'react';
import { flexRender } from '@tanstack/react-table';
import { cn } from 'erxes-ui/lib/utils';
import { RecordTableCell } from './RecordTableCell';
import { useRecordTable } from './RecordTableProvider';
import { RecordTableRow } from './RecordTableRow';

/** Past this many rows, a row out of view renders as an empty placeholder cell. */
const VIRTUALIZE_AFTER = 200;

/**
 * The rows, rendered again when the data or the column order, visibility or pinning changes.
 * The leaf headers keep their identity while a column is resized (only CSS variables change
 * then), so resizing renders no rows. Selection re-renders only the rows it touches.
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
  const virtualize = rows.length > VIRTUALIZE_AFTER;

  return rows.map((row, rowIndex) => {
    const cells = row.getAllCellsByColumnId();

    return (
      <Row
        key={row.id}
        rowId={row.id}
        original={row.original}
        columnCount={leafHeaders.length}
        virtualize={virtualize}
        handleRowViewChange={(inView) => handleRowViewChange?.(row.id, inView)}
      >
        {leafHeaders.map(({ column }) => {
          const cell = cells[column.id];

          return (
            cell && (
              <RecordTableCell
                key={cell.id}
                columnId={column.id}
                pinned={column.getIsPinned() === 'start'}
                className={cn(rowIndex === 0 && 'border-t')}
              >
                {flexRender(column.columnDef.cell, cell.getContext())}
              </RecordTableCell>
            )
          );
        })}
      </Row>
    );
  });
};
