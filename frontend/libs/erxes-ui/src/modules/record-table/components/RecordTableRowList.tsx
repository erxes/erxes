import { cn } from 'erxes-ui/lib';
import { RecordTableCell } from './RecordTableCell';
import { useRecordTable } from './RecordTableProvider';
import { RecordTableRow } from './RecordTableRow';
import { flexRender } from '@tanstack/react-table';
import { useMemo } from 'react';

export const RecordTableRowList = ({
  handleRowViewChange,
  Row,
}: {
  handleRowViewChange?: (id: string, inView: boolean) => void;
  Row?: React.ComponentType<React.ComponentProps<typeof RecordTableRow>>;
}) => {
  const { table } = useRecordTable();
  const RowComponent = Row || RecordTableRow;

  const tableContent = table.getRowModel().rows.map((row, rowIndex) => (
    <RowComponent
      key={row.id}
      original={row.original}
      data-state={row.getIsSelected() && 'selected'}
      handleRowViewChange={(inView) =>
        handleRowViewChange?.(row.original._id, inView)
      }
    >
      {row.getVisibleCells().map((cell) => (
        <RecordTableCell
          cell={cell}
          key={cell.id}
          className={cn(rowIndex === 0 && 'border-t')}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </RecordTableCell>
      ))}
    </RowComponent>
  ));

  const memoizedTableContent = useMemo(
    () => tableContent,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [table.options.data, table.getState().columnOrder],
  );
  return table.getState().columnSizingInfo.isResizingColumn
    ? memoizedTableContent
    : tableContent;
};
