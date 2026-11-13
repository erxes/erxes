// TanStack Table v8 hands out one mutable table, row and column object and changes what their
// getters return in place. Compiled, these reads would be cached on objects that never change,
// and selection, sizing and column order would stop showing. TanStack Table 9's store fixes this.
'use no memo';

import { memo, type ComponentProps, type ComponentType } from 'react';
import { flexRender, type Row as TableRow } from '@tanstack/react-table';
import { cn } from 'erxes-ui/lib/utils';
import { RecordTableCell } from './RecordTableCell';
import { useRecordTable } from './RecordTableProvider';
import { RecordTableRow } from './RecordTableRow';

interface RowsProps {
  rows: TableRow<unknown>[];
  columnOrder: string[];
  isResizing: boolean;
  handleRowViewChange?: (id: string, inView: boolean) => void;
  Row: ComponentType<ComponentProps<typeof RecordTableRow>>;
}

const RowsBody = ({ rows, handleRowViewChange, Row }: RowsProps) =>
  rows.map((row, rowIndex) => (
    <Row
      key={row.id}
      original={row.original}
      data-state={row.getIsSelected() && 'selected'}
      handleRowViewChange={(inView) => handleRowViewChange?.(row.id, inView)}
    >
      {row.getVisibleCells().map((cell) => (
        <RecordTableCell cell={cell} key={cell.id} className={cn(rowIndex === 0 && 'border-t')}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </RecordTableCell>
      ))}
    </Row>
  ));

// While a column is resized only its width variables change, so the rows are not re-rendered.
const Rows = memo(
  RowsBody,
  (prev, next) =>
    next.isResizing && prev.rows === next.rows && prev.columnOrder === next.columnOrder,
);

export const RecordTableRowList = ({
  handleRowViewChange,
  Row = RecordTableRow,
}: {
  handleRowViewChange?: (id: string, inView: boolean) => void;
  Row?: ComponentType<ComponentProps<typeof RecordTableRow>>;
}) => {
  const { table } = useRecordTable();
  const { columnOrder, columnSizingInfo } = table.getState();

  return (
    <Rows
      rows={table.getRowModel().rows}
      columnOrder={columnOrder}
      isResizing={Boolean(columnSizingInfo.isResizingColumn)}
      handleRowViewChange={handleRowViewChange}
      Row={Row}
    />
  );
};
