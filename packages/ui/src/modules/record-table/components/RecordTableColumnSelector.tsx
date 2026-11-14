import { isValidElement } from 'react';
import { DropdownMenu } from 'erxes-ui/components/dropdown-menu';
import { Button } from 'erxes-ui/components/button';
import { Checkbox } from 'erxes-ui/components/checkbox';
import { Label } from 'erxes-ui/components/label';
import { cn } from 'erxes-ui/lib/utils';
import {
  useRecordTable,
  type RecordTableFeatures,
  type RecordTableInstance,
} from './RecordTableProvider';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  DndContext,
  useSensors,
  useSensor,
  MouseSensor,
  TouchSensor,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { CSS } from '@dnd-kit/utilities';
import { IconSettings, IconGripVertical, IconPin, IconPinFilled } from '@tabler/icons-react';
import { buildHeaderGroups, type Column, type RowData } from '@tanstack/react-table';

type RecordTableColumn = Column<RecordTableFeatures, RowData>;

/** The header text, or the `label` of an inline head component, or the column id. */
const getColumnLabel = (column: RecordTableColumn, table: RecordTableInstance) => {
  const { header } = column.columnDef;

  if (typeof header === 'string') return header;

  if (typeof header !== 'function') return column.id;

  // Hidden columns have no header in the table, so one is built for the column alone.
  const columnHeader = buildHeaderGroups(table.getAllColumns(), [column], table).at(-1)?.headers[0];

  if (!columnHeader) return column.id;

  try {
    const headerNode: unknown = header(columnHeader.getContext());

    if (isValidElement<{ label?: unknown }>(headerNode)) {
      const { label } = headerNode.props;

      if (typeof label === 'string') return label;
    }
  } catch {
    // A header that needs its context renders no label here.
  }

  return column.id;
};

/** One column in the selector. Its state comes in as props: the column object is stable. */
const SortableColumnItem = ({
  column,
  label,
  visible,
  pinned,
  isLastVisible,
}: {
  column: RecordTableColumn;
  label: string;
  visible: boolean;
  pinned: boolean;
  isLastVisible: boolean;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    disabled: pinned,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        '--sortable-transform': CSS.Translate.toString(transform),
        '--sortable-transition': transition,
      }}
      className={cn(
        'sortable flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 rounded-sm',
        isDragging && 'opacity-50 bg-muted',
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={`text-muted-foreground flex-none flex items-center ${
          pinned ? 'cursor-default opacity-30' : 'cursor-grab'
        }`}
      >
        <IconGripVertical size={14} />
      </div>

      <Checkbox
        id={`col-visibility-${column.id}`}
        checked={visible}
        disabled={isLastVisible}
        title={isLastVisible ? 'At least one column must stay visible' : undefined}
        onCheckedChange={(checked) => column.toggleVisibility(checked)}
      />

      <Label
        htmlFor={`col-visibility-${column.id}`}
        variant="option"
        className="cursor-pointer select-none w-full"
      >
        <span className="block truncate">{label}</span>
      </Label>

      <Button
        variant="ghost"
        size="icon"
        title={pinned ? 'Unpin column' : 'Pin column to left'}
        aria-label={pinned ? 'Unpin column' : 'Pin column to left'}
        tone="muted"
        className="size-5 flex-none"
        onClick={(e) => {
          e.preventDefault();
          column.pin(pinned ? false : 'start');
        }}
      >
        {pinned ? <IconPinFilled size={13} /> : <IconPin size={13} />}
      </Button>
    </div>
  );
};

export const RecordTableColumnSelector = ({
  align = 'start',
}: {
  align?: 'start' | 'center' | 'end';
}) => {
  const { table, columnSelectorOpen, setColumnSelectorOpen } = useRecordTable();

  // The table renders again on every layout change, so these reads are current.
  const columns = table
    .getAllLeafColumns()
    .filter((col) => col.id !== 'checkbox' && col.id !== 'select' && col.id !== 'more')
    .map((column) => ({
      column,
      label: getColumnLabel(column, table),
      visible: column.getIsVisible(),
      pinned: Boolean(column.getIsPinned()),
    }));

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;

    table.setColumnOrder((order) =>
      arrayMove(order, order.indexOf(String(active.id)), order.indexOf(String(over.id))),
    );
  };

  const visibleColumns = columns.filter((item) => item.visible);

  if (columns.length === 0) return null;

  return (
    <DropdownMenu open={columnSelectorOpen} onOpenChange={setColumnSelectorOpen}>
      <DropdownMenu.Trigger
        render={<Button variant="cell" size="icon" className="h-full w-full" />}
        aria-label="Columns"
      >
        <IconSettings />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align={align}
        className="hide-scroll max-h-(--available-height) w-72 max-w-(--available-width) overflow-y-auto overscroll-contain"
      >
        <DndContext
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columns.map((item) => item.column.id)}
            strategy={verticalListSortingStrategy}
          >
            {columns.map((item) => (
              <SortableColumnItem
                key={item.column.id}
                {...item}
                isLastVisible={
                  visibleColumns.length === 1 && visibleColumns[0]?.column.id === item.column.id
                }
              />
            ))}
          </SortableContext>
        </DndContext>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
