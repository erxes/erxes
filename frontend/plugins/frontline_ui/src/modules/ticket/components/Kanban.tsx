import type {
  Announcements,
  DndContextProps,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  createContext,
  type HTMLAttributes,
  type ReactNode,
  useContext,
  useState,
} from 'react';
import { ScrollArea, cn } from 'erxes-ui';
import { Portal } from 'radix-ui';
export type { DragEndEvent } from '@dnd-kit/core';

type KanbanItemProps = {
  id: string;
  name: string;
  column: string;
} & Record<string, unknown>;
type KanbanColumnProps = {
  id: string;
  name: string;
} & Record<string, unknown>;
type KanbanContextProps<
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps,
> = {
  columns: C[];
  data: T[];
  activeCardId: string | null;
};
const KanbanContext = createContext<KanbanContextProps>({
  columns: [],
  data: [],
  activeCardId: null,
});
export type KanbanBoardProps = {
  id: string;
  children: ReactNode;
  className?: string;
};
export const KanbanBoard = ({ id, children, className }: KanbanBoardProps) => {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      className={cn(
        'flex size-full min-h-40 min-w-80 flex-col overflow-hidden transition-all bg-gradient-to-b from-[#e0e7ff] to-[#e0e7ff50] rounded-md',
        isOver && 'shadow-focus',
        className,
      )}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
};
export type KanbanCardProps<T extends KanbanItemProps = KanbanItemProps> = T & {
  children?: ReactNode;
  className?: string;
};
export const KanbanCard = <T extends KanbanItemProps = KanbanItemProps>({
  id,
  children,
  className,
}: KanbanCardProps<T>) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transition,
    transform,
    isDragging,
  } = useSortable({
    id,
  });
  const { activeCardId } = useContext(KanbanContext) as KanbanContextProps;
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  return (
    <>
      <div style={style} {...listeners} {...attributes} ref={setNodeRef}>
        <div
          className={cn(
            'cursor-grab gap-4 rounded-lg shadow-sm bg-background',
            isDragging && 'pointer-events-none cursor-grabbing opacity-30',
            className,
          )}
        >
          {children}
        </div>
      </div>
      {activeCardId === id && (
        <Portal.Root asChild>
          <div>
            <DragOverlay>
              <div
                className={cn(
                  'cursor-grab gap-4 rounded-lg p-3 bg-background',
                  isDragging && 'cursor-grabbing shadow-focus',
                  className,
                )}
              >
                {children}
              </div>
            </DragOverlay>
          </div>
        </Portal.Root>
      )}
    </>
  );
};
export type KanbanCardsProps<T extends KanbanItemProps = KanbanItemProps> =
  Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'id'> & {
    children: (item: T) => ReactNode;
    id: string;
  };
export const KanbanCards = <T extends KanbanItemProps = KanbanItemProps>({
  children,
  className,
  ...props
}: KanbanCardsProps<T>) => {
  const { data } = useContext(KanbanContext) as KanbanContextProps<T>;
  const filteredData = data.filter((item) => item.column === props.id);
  const items = filteredData.map((item) => item.id);
  return (
    <ScrollArea className="overflow-hidden">
      <SortableContext items={items}>
        <div
          className={cn(
            'flex flex-grow flex-col gap-2 p-2 pt-px relative',
            className,
          )}
          {...props}
        >
          {filteredData.map(children)}
        </div>
      </SortableContext>
      <ScrollArea.Bar orientation="vertical" />
    </ScrollArea>
  );
};
export type KanbanHeaderProps = HTMLAttributes<HTMLDivElement>;
export const KanbanHeader = ({ className, ...props }: KanbanHeaderProps) => (
  <div
    className={cn(
      'm-0 px-3 h-10 flex-none font-semibold text-sm flex items-center justify-between',
      className,
    )}
    {...props}
  />
);
export type KanbanProviderProps<
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps,
> = Omit<DndContextProps, 'children'> & {
  children: (column: C) => ReactNode;
  className?: string;
  columns: C[];
  data: T[];
  onDataChange?: (data: T[]) => void;
  onDragStart?: (event: DragStartEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
};
export const KanbanProvider = <
  T extends KanbanItemProps = KanbanItemProps,
  C extends KanbanColumnProps = KanbanColumnProps,
>({
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  className,
  columns,
  data,
  onDataChange,
  ...props
}: KanbanProviderProps<T, C>) => {
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor),
  );
  const handleDragStart = (event: DragStartEvent) => {
    const card = data.find((item) => item.id === event.active.id);
    if (card) {
      setActiveCardId(event.active.id as string);
    }
    onDragStart?.(event);
  };
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) {
      return;
    }
    const activeItem = data.find((item) => item.id === active.id);
    const overItem = data.find((item) => item.id === over.id);
    if (!activeItem) {
      return;
    }
    const activeColumn = activeItem.column;
    const overColumn =
      overItem?.column ||
      columns.find((col) => col.id === over.id)?.id ||
      columns[0]?.id;
    if (activeColumn !== overColumn) {
      let newData = [...data];
      const activeIndex = newData.findIndex((item) => item.id === active.id);
      const overIndex = newData.findIndex((item) => item.id === over.id);
      newData[activeIndex].column = overColumn;
      newData = arrayMove(newData, activeIndex, overIndex);
      onDataChange?.(newData);
    }
    onDragOver?.(event);
  };
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCardId(null);
    onDragEnd?.(event);
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }
    let newData = [...data];
    const oldIndex = newData.findIndex((item) => item.id === active.id);
    const newIndex = newData.findIndex((item) => item.id === over.id);
    newData = arrayMove(newData, oldIndex, newIndex);
    onDataChange?.(newData);
  };
  const announcements: Announcements = {
    onDragStart({ active }) {
      const { name, column } = data.find((item) => item.id === active.id) ?? {};
      return `Picked up the card "${name}" from the "${column}" column`;
    },
    onDragOver({ active, over }) {
      const { name } = data.find((item) => item.id === active.id) ?? {};
      const newColumn = columns.find((column) => column.id === over?.id)?.name;
      return `Dragged the card "${name}" over the "${newColumn}" column`;
    },
    onDragEnd({ active, over }) {
      const { name } = data.find((item) => item.id === active.id) ?? {};
      const newColumn = columns.find((column) => column.id === over?.id)?.name;
      return `Dropped the card "${name}" into the "${newColumn}" column`;
    },
    onDragCancel({ active }) {
      const { name } = data.find((item) => item.id === active.id) ?? {};
      return `Cancelled dragging the card "${name}"`;
    },
  };
  return (
    <KanbanContext.Provider value={{ columns, data, activeCardId }}>
      <DndContext
        accessibility={{ announcements }}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        sensors={sensors}
        {...props}
      >
        <div
          className={cn(
            'flex flex-auto gap-4 overflow-x-auto p-5 pb-0',
            className,
          )}
        >
          {columns.map((column) => children(column))}
        </div>
      </DndContext>
    </KanbanContext.Provider>
  );
};
