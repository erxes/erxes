import type {
  Announcements,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  KanbanBoardProps,
  KanbanCardProps,
  KanbanContextProps,
  KanbanProviderProps,
} from './types';
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable';
import { createContext, useContext, useState } from 'react';

import { CSS } from '@dnd-kit/utilities';
import { Card } from './Card';
import { IDeal } from '@/deals/types/deals';
import { IStage } from '@/deals/types/stages';
import { cn } from 'erxes-ui';
import { Portal } from 'radix-ui';

export type { DragEndEvent } from '@dnd-kit/core';

export const getTypeAndId = (id: string) => {
  const [type, ...rest] = id.split('-');
  return { type, id: rest.join('-') };
};

export const KanbanContext = createContext<KanbanContextProps>({
  columns: [],
  data: [],
  activeCardId: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onDataChange: () => { },
});

export const KanbanBoard = ({ _id, children, className }: KanbanBoardProps) => {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `column-${_id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      className={cn(
        'w-72 flex-none bg-gradient-to-b from-[#e0e7ff] to-[#e0e7ff50] rounded-md transition-all h-full flex flex-col overflow-hidden',
        isDragging ? 'ring-primary' : 'ring-transparent',
        className,
      )}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};

export const KanbanCard = ({
  children,
  className,
  featureId,
  card,
}: KanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `card-${featureId}` });
  const { activeCardId } = useContext(KanbanContext) as KanbanContextProps;

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  return (
    <>
      <div
        key={featureId}
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        style={style}
      >
        <Card
          className={cn(
            'cursor-grab',
            isDragging && 'pointer-events-none cursor-grabbing opacity-30',
            className,
          )}
          card={card}
        >
          {children ?? <p className="m-0 font-medium text-sm">{card.name}</p>}
        </Card>
      </div>
      {activeCardId === featureId && (
        <Portal.Root asChild>
          <div>
            <DragOverlay>
              <Card
                className={cn(
                  'cursor-grab ring-2 ring-primary',
                  isDragging && 'cursor-grabbing',
                  className,
                )}
                card={card}
              >
                {children ?? (
                  <p className="m-0 font-medium text-sm">{card.name}</p>
                )}
              </Card>
            </DragOverlay>
          </div>
        </Portal.Root>
      )}
    </>
  );
};

export const KanbanProvider = <
  T extends IDeal = IDeal,
  C extends IStage = IStage,
>({
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  className,
  columns,
  data,
  onDataChange,
  onColumnsChange,
  updateOrders,
  ...props
}: KanbanProviderProps<T, C>) => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // prevent unintended drags
      },
    }),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { type, id } = getTypeAndId(event.active.id as string);

    if (type === 'card') {
      const card = data.find((item) => item._id === id);

      if (card) {
        setActiveCardId(`card-${id}`); // use full ID since that's what useSortable uses
      }
    }

    onDragStart?.(event);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }

    const { type: activeType, id: activeId } = getTypeAndId(
      active.id as string,
    );
    const { type: overType, id: overId } = getTypeAndId(over.id as string);

    // COLUMN DRAGGING
    if (activeType === 'column' && overType === 'column') {
      const activeIndex = columns.findIndex((col) => col._id === activeId);
      const overIndex = columns.findIndex((col) => col._id === overId);

      if (activeIndex !== -1 && overIndex !== -1) {
        const newColumns = arrayMove(columns, activeIndex, overIndex);
        onColumnsChange?.(newColumns);
      }
      return;
    }

    if (activeType === 'card' && overType === 'column') {
      const newData = [...data];
      const activeIndex = newData.findIndex((item) => item._id === activeId);
      if (activeIndex === -1) return;

      const targetColumn = columns.find((col) => col._id === overId);
      if (!targetColumn) return;

      newData[activeIndex] = {
        ...newData[activeIndex],
        stage: targetColumn,
      };

      onDataChange?.(newData);
      return;
    }

    // CARD DRAGGING
    if (activeType === 'card' && overType === 'card') {
      const activeItem = data.find((item) => item._id === activeId);
      const overItem = data.find((item) => item._id === overId);
      if (!(activeItem && overItem)) return;

      if (activeItem.stage?._id !== overItem.stage?._id) {
        let newData = [...data];

        const activeIndex = newData.findIndex((item) => item._id === activeId);
        const overIndex = newData.findIndex((item) => item._id === overId);

        if (activeIndex === -1 || overIndex === -1) return;

        // Update stage object by copying overItem.stage to active card
        const updatedActiveItem = {
          ...newData[activeIndex],
          stage: { ...overItem.stage },
        };
        newData[activeIndex] = updatedActiveItem;

        newData = arrayMove(newData, activeIndex, overIndex);

        onDataChange?.(newData);
      }
    }

    onDragOver?.(event);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveCardId(null);
    onDragEnd?.(event);

    if (!over || active.id === over.id) {
      return;
    }

    const { type: activeType, id: activeId } = getTypeAndId(
      active.id as string,
    );
    const { type: overType, id: overId } = getTypeAndId(over.id as string);

    // COLUMN DRAG
    if (activeType === 'column' && overType === 'column') {
      const activeColumnIndex = columns.findIndex(
        (col) => col._id === activeId,
      );
      const overColumnIndex = columns.findIndex((col) => col._id === overId);

      if (activeColumnIndex !== -1 && overColumnIndex !== -1) {
        const newColumns = arrayMove(
          columns,
          activeColumnIndex,
          overColumnIndex,
        );

        onColumnsChange?.(newColumns);
      }

      updateOrders?.(
        {
          orders: columns.map((col, index) => ({
            _id: col._id,
            order: index,
          })),
        },
        'column',
      );
      return;
    }

    if (activeType === 'card' && overType === 'column') {
      const newData = [...data];
      const activeIndex = newData.findIndex((item) => item._id === activeId);
      if (activeIndex === -1) return;

      const targetColumn = columns.find((col) => col._id === overId);
      if (!targetColumn) return;

      newData[activeIndex] = {
        ...newData[activeIndex],
        stage: targetColumn,
      };

      onDataChange?.(newData);

      updateOrders?.(
        {
          itemId: activeId,
          destinationStageId: overId,
          // aboveItemId: overId
        },
        'card',
      );

      return;
    }

    // CARD DRAG
    if (activeType === 'card' && overType === 'card') {
      const activeItem = data.find((item) => item._id === activeId);
      const overItem = data.find((item) => item._id === overId);
      if (!(activeItem && overItem)) return;

      const newData = [...data];
      const activeIndex = newData.findIndex((item) => item._id === activeId);
      if (activeIndex === -1) return;

      // Clone and update active card's stage if different
      if (activeItem.stage?._id !== overItem.stage?._id) {
        newData[activeIndex] = {
          ...newData[activeIndex],
          stage: { ...overItem.stage },
        };
      }

      // Get all cards in the target stage (after update if changed)
      const targetStageId = newData[activeIndex].stage?._id;
      const cardsInStage = newData.filter(
        (item) => item.stage?._id === targetStageId,
      );

      const activePos = cardsInStage.findIndex((item) => item._id === activeId);
      const overPos = cardsInStage.findIndex((item) => item._id === overId);

      if (activePos === -1 || overPos === -1) return;

      const reorderedCards = arrayMove(cardsInStage, activePos, overPos);

      const otherCards = newData.filter(
        (item) => item.stage?._id !== targetStageId,
      );

      const mergedData = [...otherCards, ...reorderedCards];

      onDataChange?.(mergedData);

      updateOrders?.(
        {
          itemId: activeId,
          destinationStageId: overItem.stage?._id,
        },
        'card',
      );
    }

    onDragEnd?.(event);
  };

  const announcements: Announcements = {
    onDragStart({ active }) {
      const { type, id } = getTypeAndId(active.id as string);

      if (type !== 'card') return;

      const item = data.find((item) => item._id === id);
      if (!item) return;

      return `Picked up the card "${item.name}" from the "${item.stage?.name}" column`;
    },

    onDragOver({ active, over }) {
      const { type, id } = getTypeAndId(active.id as string);
      const { id: overId } = getTypeAndId(over?.id as string);

      if (type !== 'card') return;

      const item = data.find((item) => item._id === id);
      const column = columns.find((col) => col._id === overId);

      return `Dragged the card "${item?.name}" over the "${column?.name}" column`;
    },

    onDragEnd({ active, over }) {
      const { type, id } = getTypeAndId(active.id as string);
      const { id: overId } = getTypeAndId(over?.id as string);

      if (type !== 'card') return;

      const item = data.find((item) => item._id === id);
      const column = columns.find((col) => col._id === overId);

      return `Dropped the card "${item?.name}" into the "${column?.name}" column`;
    },

    onDragCancel({ active }) {
      const { type, id } = getTypeAndId(active.id as string);

      if (type !== 'card') return;

      const item = data.find((item) => item._id === id);

      return `Cancelled dragging the card "${item?.name}"`;
    },
  };

  return (
    <KanbanContext.Provider
      value={{ columns, data, activeCardId, onDataChange }}
    >
      <DndContext
        accessibility={{ announcements }}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        sensors={sensors}
        {...props}
      >
        <SortableContext items={columns.map((c) => `column-${c._id}`)}>
          <div
            className={cn(
              'flex gap-3 p-4 pb-0 h-full select-none w-max',
              className,
            )}
          >
            {columns.map((column) => children(column))}
          </div>
        </SortableContext>
      </DndContext>
    </KanbanContext.Provider>
  );
};
