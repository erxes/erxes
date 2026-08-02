import { Checkbox } from 'erxes-ui/components/checkbox';
import { ColumnDef, Row } from '@tanstack/react-table';

// A pointer drag is a single global interaction, so this transient state lives
// at module scope rather than being threaded through the table context.
const dragSelection = {
  active: false,
  selecting: false,
  suppressClickOn: null as string | null,
};

const endDragSelection = () => {
  dragSelection.active = false;
  document.body.style.userSelect = '';
};

const startDragSelection = (selecting: boolean, rowId: string) => {
  dragSelection.active = true;
  dragSelection.selecting = selecting;
  dragSelection.suppressClickOn = rowId;
  // Shift + drag would otherwise paint a text selection across the rows.
  document.body.style.userSelect = 'none';
  window.addEventListener('pointerup', endDragSelection, { once: true });
};

const CheckboxCell = ({ row }: { row: Row<any> }) => (
  <div
    className="flex items-center justify-center size-full"
    onPointerDown={(event) => {
      // A fresh press always precedes that element's click, so this also clears
      // a suppression left dangling by a drag that ended on another row.
      dragSelection.suppressClickOn = null;

      if (!event.shiftKey || event.button !== 0) {
        return;
      }

      event.preventDefault();
      const selecting = !row.getIsSelected();
      startDragSelection(selecting, row.id);
      row.toggleSelected(selecting);
    }}
    onPointerEnter={(event) => {
      // event.buttons guards against a drag left dangling by a missed pointerup.
      if (!dragSelection.active || event.buttons !== 1) {
        return;
      }

      row.toggleSelected(dragSelection.selecting);
    }}
    onClickCapture={(event) => {
      // pointerdown already applied the change; swallow the click that Radix
      // would otherwise turn into a second toggle of the row we started on.
      if (dragSelection.suppressClickOn !== row.id) {
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
  cell: ({ row }) => <CheckboxCell row={row} />,
};
