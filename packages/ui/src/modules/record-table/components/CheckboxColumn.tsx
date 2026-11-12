import { Checkbox } from 'erxes-ui/components/checkbox';
import type { ColumnDef, Row, Table } from '@tanstack/react-table';

/** A shift-drag across checkboxes selects (or clears) every row it passes, in one table. */
const dragSelection: {
  /** The table being drag-selected, compared by identity. */
  table: object | null;
  selecting: boolean;
  suppressClickOn: { table: object; rowId: string } | null;
} = { table: null, selecting: false, suppressClickOn: null };

const DRAG_END_EVENTS = ['pointerup', 'pointercancel', 'blur'] as const;

const endDragSelection = () => {
  dragSelection.table = null;
  document.body.style.userSelect = '';
  DRAG_END_EVENTS.forEach((event) => window.removeEventListener(event, endDragSelection));
};

const startDragSelection = (selecting: boolean, rowId: string, table: object) => {
  dragSelection.table = table;
  dragSelection.selecting = selecting;
  dragSelection.suppressClickOn = { table, rowId };
  document.body.style.userSelect = 'none';
  DRAG_END_EVENTS.forEach((event) => window.addEventListener(event, endDragSelection));
};

const CheckboxCell = <TData,>({ row, table }: { row: Row<TData>; table: Table<TData> }) => (
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
      const selecting = !row.getIsSelected();
      startDragSelection(selecting, row.id, table);
      row.toggleSelected(selecting);
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
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
    />
  </div>
);

/** The row selection column, typed for a table of `TData`. */
export const checkboxColumnOf = <TData,>(): ColumnDef<TData> => ({
  id: 'checkbox',
  header: ({ table }) => (
    <div className="flex items-center justify-center h-8">
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all rows"
      />
    </div>
  ),
  size: 33,
  cell: ({ row, table }) => <CheckboxCell row={row} table={table} />,
});

/** The selection column for plugins that build untyped columns; typed tables use checkboxColumnOf. */
export const checkboxColumn = checkboxColumnOf<unknown>();
