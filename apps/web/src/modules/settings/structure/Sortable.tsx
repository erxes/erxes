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

/** A row dragged by its grip; without `sortable` the grip is left out. */
export const SortableRow = ({
  id,
  name,
  sortable,
  className,
  children,
}: {
  id: string;
  name: string;
  sortable: boolean;
  className?: string;
  children: ReactNode;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'structure' });

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
      className={cn('sortable flex items-center gap-2', isDragging && 'z-10 opacity-40', className)}
    >
      {sortable && (
        <Button
          variant="ghost"
          size="icon"
          tone="muted"
          className="size-6 shrink-0 cursor-grab"
          aria-label={t('drag-named', 'Drag {{name}}', { name })}
          {...attributes}
          {...listeners}
        >
          <IconGripVertical />
        </Button>
      )}
      {children}
    </li>
  );
};

/** A vertical list whose rows drag into a new order; `onOrder` gets the ids in it. */
export const SortableList = ({
  ids,
  nameOf,
  onOrder,
  className,
  children,
}: {
  ids: string[];
  nameOf: (id: string) => string;
  onOrder: (ids: string[]) => void;
  className?: string;
  children: ReactNode;
}) => {
  const sensors = useSortSensors();
  const sortList = useSortList((id) => nameOf(String(id)));

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const from = ids.indexOf(String(active.id));
    const to = over ? ids.indexOf(String(over.id)) : -1;

    if (from !== -1 && to !== -1 && from !== to) onOrder(arrayMove(ids, from, to));
  };

  return (
    <DndContext
      {...sortList}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={onDragEnd}
      sensors={sensors}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className={className}>{children}</ul>
      </SortableContext>
    </DndContext>
  );
};
