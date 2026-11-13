import { Checkbox } from 'erxes-ui/components/checkbox';
import type { Row, RowData, Table } from '@tanstack/react-table';
import {
  useRecordTable,
  useRecordTableState,
  type RecordTableColumnDef,
  type RecordTableFeatures,
} from './RecordTableProvider';

/** Any table, whatever its row type; drag selection compares tables by identity. */
type SelectionTable = Pick<Table<RecordTableFeatures, never>, 'resetRowSelection'>;

/** A shift-drag across checkboxes selects (or clears) every row it passes, in one table. */
const dragSelection: {
  table: SelectionTable | null;
  selecting: boolean;
  suppressClickOn: { table: SelectionTable; rowId: string } | null;
} = { table: null, selecting: false, suppressClickOn: null };

const DRAG_END_EVENTS = ['pointerup', 'pointercancel', 'blur'] as const;

const endDragSelection = () => {
  dragSelection.table = null;
  document.body.style.userSelect = '';
  DRAG_END_EVENTS.forEach((event) => window.removeEventListener(event, endDragSelection));
};

const startDragSelection = (selecting: boolean, rowId: string, table: SelectionTable) => {
  dragSelection.table = table;
  dragSelection.selecting = selecting;
  dragSelection.suppressClickOn = { table, rowId };
  document.body.style.userSelect = 'none';
  DRAG_END_EVENTS.forEach((event) => window.addEventListener(event, endDragSelection));
};

const CheckboxCell = <TData extends RowData>({
  row,
  table,
}: {
  row: Row<RecordTableFeatures, TData>;
  table: Table<RecordTableFeatures, TData>;
}) => {
  const selected = useRecordTableState((state) => Boolean(state.rowSelection[row.id]));

  return (
    // The checkbox is the control; the cell only extends shift-drag selection across rows.
    <div
      role="presentation"
      className="flex items-center justify-center size-full"
      onPointerDown={(event) => {
        dragSelection.suppressClickOn = null;

        if (!event.shiftKey || event.button !== 0) {
          return;
        }

        event.preventDefault();
        startDragSelection(!selected, row.id, table);
        row.toggleSelected(!selected);
      }}
      onPointerEnter={(event) => {
        if (dragSelection.table !== table || event.buttons !== 1) {
          return;
        }

        row.toggleSelected(dragSelection.selecting);
      }}
      onClickCapture={(event) => {
        const suppressed = dragSelection.suppressClickOn;

        if (suppressed?.table !== table || suppressed.rowId !== row.id) {
          return;
        }

        dragSelection.suppressClickOn = null;
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      <Checkbox
        checked={selected}
        onCheckedChange={(value) => row.toggleSelected(value)}
        aria-label="Select row"
      />
    </div>
  );
};

/** Checked when every loaded row is selected, indeterminate when some are. */
const SelectAllCheckbox = () => {
  const { table } = useRecordTable();

  const { all, some } = useRecordTableState(({ rowSelection }, current) => {
    const { rows } = current.getRowModel();
    const selected = rows.filter((row) => rowSelection[row.id]).length;

    return {
      all: rows.length > 0 && selected === rows.length,
      some: selected > 0,
    };
  });

  return (
    <div className="flex items-center justify-center h-8">
      <Checkbox
        checked={all}
        indeterminate={!all && some}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(value)}
        aria-label="Select all rows"
      />
    </div>
  );
};

/** The row selection column, typed for a table of `TData`. */
export const checkboxColumnOf = <TData extends RowData>(): RecordTableColumnDef<TData> => ({
  id: 'checkbox',
  header: () => <SelectAllCheckbox />,
  size: 33,
  cell: ({ row, table }) => <CheckboxCell row={row} table={table} />,
});

/** The selection column for plugins that build untyped columns; typed tables use checkboxColumnOf. */
export const checkboxColumn = checkboxColumnOf<RowData>();
