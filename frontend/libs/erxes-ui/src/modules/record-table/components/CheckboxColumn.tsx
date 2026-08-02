import { Checkbox } from 'erxes-ui/components/checkbox';
import { ColumnDef, Row, Table } from '@tanstack/react-table';

const dragSelection = {
  owner: null as Table<any> | null,
  selecting: false,
  suppressClickOn: null as { table: Table<any>; rowId: string } | null,
};

const DRAG_END_EVENTS = ['pointerup', 'pointercancel', 'blur'] as const;

const endDragSelection = () => {
  dragSelection.owner = null;
  document.body.style.userSelect = '';
  DRAG_END_EVENTS.forEach((event) =>
    window.removeEventListener(event, endDragSelection),
  );
};

const startDragSelection = (
  selecting: boolean,
  row: Row<any>,
  table: Table<any>,
) => {
  dragSelection.owner = table;
  dragSelection.selecting = selecting;
  dragSelection.suppressClickOn = { table, rowId: row.id };
  document.body.style.userSelect = 'none';
  DRAG_END_EVENTS.forEach((event) =>
    window.addEventListener(event, endDragSelection),
  );
};

const CheckboxCell = ({ row, table }: { row: Row<any>; table: Table<any> }) => (
  <div
    className="flex items-center justify-center size-full"
    onPointerDown={(event) => {
      dragSelection.suppressClickOn = null;

      if (!event.shiftKey || event.button !== 0) {
        return;
      }

      event.preventDefault();
      const selecting = !row.getIsSelected();
      startDragSelection(selecting, row, table);
      row.toggleSelected(selecting);
    }}
    onPointerEnter={(event) => {
      if (dragSelection.owner !== table || event.buttons !== 1) {
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

export const checkboxColumn: ColumnDef<any> = {
  accessorKey: 'checkbox',
  id: 'checkbox',
  header: ({ table }) => {
    const isAllSelected = table.getIsAllPageRowsSelected();
    const isSomeSelected = table.getIsSomePageRowsSelected();

    return (
      <div className="flex items-center justify-center h-8">
        <Checkbox
          checked={isAllSelected || (isSomeSelected && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all rows"
        />
      </div>
    );
  },
  size: 33,
  cell: ({ row, table }) => <CheckboxCell row={row} table={table} />,
};
