// TanStack Table v8 hands out one mutable table, row and column object and changes what their
// getters return in place. Compiled, these reads would be cached on objects that never change,
// and selection, sizing and column order would stop showing. TanStack Table 9's store fixes this.
'use no memo';

import { isValidElement } from 'react';
import { DropdownMenu } from 'erxes-ui/components/dropdown-menu';
import { Button } from 'erxes-ui/components/button';
import { Checkbox } from 'erxes-ui/components/checkbox';
import { Label } from 'erxes-ui/components/label';
import { cn } from 'erxes-ui/lib/utils';
import { useRecordTable } from './RecordTableProvider';
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
import { buildHeaderGroups, type Column, type Table } from '@tanstack/react-table';

/** The header text, or the `label` of an inline head component, or the column id. */
const getColumnLabel = (column: Column<unknown>, table: Table<unknown>) => {
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

const SortableColumnItem = ({
  column,
  label,
  isLastVisible,
}: {
  column: Column<unknown>;
  label: string;
  isLastVisible: boolean;
}) => {
  const isPinned = !!column.getIsPinned();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    disabled: isPinned,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 rounded-sm',
        isDragging && 'opacity-50 bg-muted',
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={`text-muted-foreground flex-none flex items-center ${
          isPinned ? 'cursor-default opacity-30' : 'cursor-grab'
        }`}
      >
        <IconGripVertical size={14} />
      </div>

      <Checkbox
        id={`col-visibility-${column.id}`}
        checked={column.getIsVisible()}
        disabled={isLastVisible}
        title={isLastVisible ? 'At least one column must stay visible' : undefined}
        onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
      />

      <Label
        htmlFor={`col-visibility-${column.id}`}
        className="cursor-pointer select-none font-normal truncate w-full"
      >
        {label}
      </Label>

      <Button
        variant="ghost"
        size="icon"
        title={isPinned ? 'Unpin column' : 'Pin column to left'}
        aria-label={isPinned ? 'Unpin column' : 'Pin column to left'}
        className="h-5 w-5 flex-none text-muted-foreground hover:text-foreground"
        onClick={(e) => {
          e.preventDefault();
          column.pin(isPinned ? false : 'left');
        }}
      >
        {isPinned ? <IconPinFilled size={13} /> : <IconPin size={13} />}
      </Button>
    </div>
  );
};

export const RecordTableColumnSelector = ({
  children,
  align = 'start',
}: {
  children?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
}) => {
  const { table, columnSelectorOpen, setColumnSelectorOpen } = useRecordTable();

  const columns = table
    .getAllLeafColumns()
    .filter((col) => col.id !== 'checkbox' && col.id !== 'select' && col.id !== 'more');

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 100, tolerance: 5 },
    }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const currentOrder = table.getState().columnOrder;
      const oldIndex = currentOrder.indexOf(String(active.id));
      const newIndex = currentOrder.indexOf(String(over.id));
      table.setColumnOrder(arrayMove(currentOrder, oldIndex, newIndex));
    }
  };

  const visibleColumns = columns.filter((col) => col.getIsVisible());

  if (columns.length === 0) return null;

  return (
    <DropdownMenu open={columnSelectorOpen} onOpenChange={setColumnSelectorOpen}>
      <DropdownMenu.Trigger asChild>
        {children ?? (
          <Button variant="ghost" className="h-full w-full rounded-none px-0">
            <IconSettings />
          </Button>
        )}
      </DropdownMenu.Trigger>

      <DropdownMenu.Content
        align={align}
        className="hide-scroll max-h-(--radix-dropdown-menu-content-available-height) w-72 max-w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain p-1"
      >
        <DndContext
          sensors={sensors}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={columns.map((col) => col.id)}
            strategy={verticalListSortingStrategy}
          >
            {columns.map((column) => (
              <SortableColumnItem
                key={column.id}
                column={column}
                label={getColumnLabel(column, table)}
                isLastVisible={visibleColumns.length === 1 && visibleColumns[0]?.id === column.id}
              />
            ))}
          </SortableContext>
        </DndContext>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
