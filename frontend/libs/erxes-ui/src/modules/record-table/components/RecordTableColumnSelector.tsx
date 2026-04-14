import { isValidElement, type ReactNode } from 'react';
import { DropdownMenu, Button, Checkbox, Label } from 'erxes-ui/components';
import { useRecordTable } from './RecordTableProvider';
import {
  DragEndEvent,
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
import { IconSettings, IconGripVertical } from '@tabler/icons-react';
import { Column } from '@tanstack/react-table';

const getColumnLabel = (column: Column<any, unknown>): string => {
  const { header } = column.columnDef;
  if (typeof header === 'string') return header;
  if (typeof header === 'function') {
    try {
      const headerNode = (header as () => ReactNode)();

      if (isValidElement<{ label?: string }>(headerNode)) {
        const inlineHeadLabel = headerNode.props?.label;

        if (typeof inlineHeadLabel === 'string') return inlineHeadLabel;
      }
    } catch {
      return column.id;
    }
  }

  return column.id;
};

const SortableColumnItem = ({ column }: { column: Column<any, unknown> }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 px-2 py-1.5 hover:bg-muted/50 rounded-sm ${
        isDragging && 'opacity-50 bg-muted'
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground flex-none flex items-center"
      >
        <IconGripVertical size={14} />
      </div>

      <Checkbox
        id={`col-visibility-${column.id}`}
        checked={column.getIsVisible()}
        onCheckedChange={(checked) => column.toggleVisibility(!!checked)}
      />

      <Label
        htmlFor={`col-visibility-${column.id}`}
        className="cursor-pointer select-none font-normal truncate w-full"
      >
        {getColumnLabel(column)}
      </Label>
    </div>
  );
};

export const RecordTableColumnSelector = ({
  children,
  align = 'start',
}: {
  children?: React.ReactElement;
  align?: 'start' | 'center' | 'end';
}) => {
  const { table } = useRecordTable();

  const columns = table
    .getAllLeafColumns()
    .filter((col) => col.id !== 'select' && !col.getIsPinned());

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
      const oldIndex = currentOrder.indexOf(active.id as string);
      const newIndex = currentOrder.indexOf(over.id as string);
      table.setColumnOrder(arrayMove(currentOrder, oldIndex, newIndex));
    }
  };

  if (columns.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        {children ?? (
          <Button variant="ghost" className="h-full w-full rounded-none px-0">
            <IconSettings />
          </Button>
        )}
      </DropdownMenu.Trigger>

      <DropdownMenu.Content align={align} className="min-w-50 p-1">
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
              <SortableColumnItem key={column.id} column={column} />
            ))}
          </SortableContext>
        </DndContext>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
