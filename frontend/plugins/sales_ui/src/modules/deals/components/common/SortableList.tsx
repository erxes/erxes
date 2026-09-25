import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import React from 'react';
import { DragHandle, cn } from 'erxes-ui';

type SortableItemType = { _id: string };

export type SortableReorderMeta<T> = {
  item: T;
  oldIndex: number;
  newIndex: number;
};

type Props<T extends SortableItemType> = {
  items: T[];
  onReorder: (items: T[], meta: SortableReorderMeta<T>) => void;
  renderItem: (
    item: T,
    index: number,
    dragHandle: React.ReactNode,
  ) => React.ReactNode;
  dragHandleLabel: string;
  className?: string;
};

export function SortableList<T extends SortableItemType>({
  items,
  onReorder,
  renderItem,
  dragHandleLabel,
  className = '',
}: Readonly<Props<T>>) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((item) => item._id === active.id);
    const newIndex = items.findIndex((item) => item._id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    onReorder(arrayMove(items, oldIndex, newIndex), {
      item: items[oldIndex],
      oldIndex,
      newIndex,
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((item) => item._id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={className}>
          {items.map((item, index) => (
            <SortableItem
              key={item._id}
              id={item._id}
              dragHandleLabel={dragHandleLabel}
              renderItem={(dragHandle) => renderItem(item, index, dragHandle)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableItem({
  id,
  dragHandleLabel,
  renderItem,
}: Readonly<{
  id: string;
  dragHandleLabel: string;
  renderItem: (dragHandle: React.ReactNode) => React.ReactNode;
}>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('group', isDragging && 'opacity-60')}
    >
      {renderItem(
        <DragHandle
          aria-label={dragHandleLabel}
          className="opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
          {...attributes}
          {...listeners}
        />,
      )}
    </div>
  );
}
