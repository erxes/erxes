import { memo, useState, type ComponentProps, type ComponentType } from 'react';
import { flexRender, type Cell, type Header, type Row, type RowData } from '@tanstack/react-table';
import { cn } from 'erxes-ui/lib/utils';
import { useRowWindow } from '../hooks/useRowWindow';
import { readRowField } from '../utils/rowFields';
import { RecordTableCell } from './RecordTableCell';
import { useRecordTable, type RecordTableFeatures } from './RecordTableProvider';
import { RecordTableRow } from './RecordTableRow';

/** Past this many rows, a table renders only the rows near the visible area. */
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

interface RowItemProps {
  row: Row<RecordTableFeatures, RowData>;
  leafHeaders: Header<RecordTableFeatures, RowData>[];
  /** The list's first row, which draws the top border. */
  first: boolean;
  /** The row starts a group (`groupBy`): its value differs from the row before it. */
  groupStart: boolean;
  Row: ComponentType<ComponentProps<typeof RecordTableRow>>;
  handleRowViewChange?: (id: string, inView: boolean) => void;
}

interface BodyCellProps {
  cell: Cell<RecordTableFeatures, RowData>;
  pinned: boolean;
  first: boolean;
}

/** One cell: its column's `cell` renderer in a `RecordTableCell`. */
const BodyCell = ({ cell, pinned, first }: BodyCellProps) => (
  <RecordTableCell columnId={cell.column.id} pinned={pinned} className={cn(first && 'border-t')}>
    {flexRender(cell.column.columnDef.cell, cell.getContext())}
  </RecordTableCell>
);

/**
 * The table builds new row and cell objects whenever its data or columns change (a page loads,
 * a column shows), so a cell is the same while its record and column definition are: then it
 * keeps what it rendered. Cells read their values from the record and change the table by the
 * row's id, so the earlier objects serve.
 */
const sameCell = (previous: BodyCellProps, next: BodyCellProps) =>
  previous.cell.id === next.cell.id &&
  previous.cell.row.original === next.cell.row.original &&
  previous.cell.column.columnDef === next.cell.column.columnDef &&
  previous.pinned === next.pinned &&
  previous.first === next.first;

const MemoBodyCell = memo(BodyCell, sameCell);

/** One row and its cells. */
const RowItem = ({
  row,
  leafHeaders,
  first,
  groupStart,
  Row,
  handleRowViewChange,
}: RowItemProps) => {
  const cells = row.getAllCellsByColumnId();

  return (
    <Row
      rowId={row.id}
      original={row.original}
      groupStart={groupStart}
      handleRowViewChange={handleRowViewChange && ((inView) => handleRowViewChange(row.id, inView))}
    >
      {leafHeaders.map(({ column }) => {
        const cell = cells[column.id];

        return (
          cell && (
            <MemoBodyCell
              key={cell.id}
              cell={cell}
              pinned={column.getIsPinned() === 'start'}
              first={first}
            />
          )
        );
      })}
    </Row>
  );
};

/** A row is the same while its record and id are, as `sameCell` says of its cells. */
const sameRow = (previous: RowItemProps, next: RowItemProps) =>
  previous.row.id === next.row.id &&
  previous.row.original === next.row.original &&
  previous.leafHeaders === next.leafHeaders &&
  previous.first === next.first &&
  previous.groupStart === next.groupStart &&
  previous.Row === next.Row &&
  previous.handleRowViewChange === next.handleRowViewChange;

const MemoRowItem = memo(RowItem, sameRow);

/**
 * The rows. A row renders again only when its record, the column order, visibility or pinning
 * changes: a page loading, or the visible slice moving, renders only the rows it adds. The
 * leaf headers keep their identity while a column is resized (only CSS variables change
 * then), so resizing renders no rows. Selection re-renders only the rows it touches. With more
 * than `WINDOW_AFTER` rows, only the rows near the visible area of the table's scroll
 * container (or the page) render, so a long list keeps a small page. With `groupBy`, a row whose
 * group differs from the row before it starts a group (3.x's rule between a T-account's vouchers).
 */
export const RecordTableRowList = ({
  handleRowViewChange,
  Row = RecordTableRow,
  groupBy,
}: {
  handleRowViewChange?: (id: string, inView: boolean) => void;
  Row?: ComponentType<ComponentProps<typeof RecordTableRow>>;
  /** The record field that names a row's group, such as its voucher (`ptrId`). */
  groupBy?: string;
}) => {
  const { table } = useRecordTable();
  const { rows } = table.getRowModel();
  const leafHeaders = table.getHeaderGroups().at(-1)?.headers ?? [];
  const windowed = rows.length > WINDOW_AFTER;
  const [listStart, setListStart] = useState<HTMLTableRowElement | null>(null);
  const slice = useRowWindow({ count: rows.length, listStart });
  const { start, end } = windowed ? slice : { start: 0, end: rows.length };

  return (
    <>
      {windowed && <RowsGap ref={setListStart} rows={start} columnCount={leafHeaders.length} />}
      {rows.slice(start, end).map((row, sliceIndex) => {
        const before = rows[start + sliceIndex - 1];

        return (
          <MemoRowItem
            key={row.id}
            row={row}
            leafHeaders={leafHeaders}
            first={start + sliceIndex === 0}
            groupStart={
              groupBy !== undefined &&
              before !== undefined &&
              readRowField(before.original, groupBy) !== readRowField(row.original, groupBy)
            }
            Row={Row}
            handleRowViewChange={handleRowViewChange}
          />
        );
      })}
      {windowed && <RowsGap rows={rows.length - end} columnCount={leafHeaders.length} />}
    </>
  );
};
