import { closestCenter, DndContext, type DragEndEvent } from '@dnd-kit/core';
import { restrictToParentElement, restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@tabler/icons-react';
import { Button, cn, useSortList, useSortRoleDescription } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useSortSensors } from '~/lib/sortSensors';

/**
 * A data model list dragged into a new order: `onReorder` gets the items in it. Each item is
 * a `SortableRow` with the same id.
 */
export const SortableList = <T extends { id: string }>({
  items,
  labelOf,
  onReorder,
  children,
}: {
  items: T[];
  /** What a screen reader says of an item while it moves. */
  labelOf: (item: T) => string;
  onReorder: (items: T[]) => void;
  children: ReactNode;
}) => {
  const sensors = useSortSensors();

  const sortList = useSortList((id) => {
    const item = items.find((entry) => entry.id === id);

    return item ? labelOf(item) : String(id);
  });

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const from = items.findIndex((item) => item.id === active.id);
    const to = items.findIndex((item) => item.id === over?.id);

    if (from === -1 || to === -1 || from === to) return;

    onReorder(arrayMove(items, from, to));
  };

  return (
    <DndContext
      {...sortList}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-1">{children}</ul>
      </SortableContext>
    </DndContext>
  );
};

/** One row of a `SortableList`, dragged by its grip; not `sortable`, it stays where it is. */
export const SortableRow = ({
  id,
  label,
  sortable,
  children,
}: {
  id: string;
  /** What the row is, for its grip's name ("Move Tier"). */
  label: string;
  sortable: boolean;
  children: ReactNode;
}) => {
  const { t } = useTranslation('data', { keyPrefix: 'fields' });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled: !sortable,
    attributes: { roleDescription: useSortRoleDescription() },
  });

  return (
    <li
      ref={setNodeRef}
      style={{
        '--sortable-transform': CSS.Transform.toString(transform),
        '--sortable-transition': transition,
      }}
      className={cn(
        'sortable flex items-center gap-2 rounded-md border bg-background px-2 py-1.5',
        isDragging && 'z-10 opacity-40',
      )}
    >
      {sortable && (
        <Button
          variant="ghost"
          size="icon"
          tone="muted"
          className="size-6 shrink-0 cursor-grab"
          {...attributes}
          aria-label={t('move', 'Move {{label}}', { label })}
          {...listeners}
        >
          <IconGripVertical />
        </Button>
      )}
      {children}
    </li>
  );
};
