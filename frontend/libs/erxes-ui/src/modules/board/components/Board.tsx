import type {
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
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ScrollArea } from 'erxes-ui/components';
import { cn } from 'erxes-ui/lib';
import {
  BoardCardProps,
  BoardColumnProps,
  BoardContextProps,
  BoardHeaderProps,
  BoardItemProps,
  BoardProps,
  BoardProviderProps,
} from '../types/boardTypes';
import { Portal } from 'radix-ui';
import { type HTMLAttributes, useContext } from 'react';
import { BoardContext } from '../contexts/BoardContext';
import {
  activeCardIdState,
  dragOverBoardColumnIdState,
} from '../states/boardStates';
import { useAtomValue, useSetAtom } from 'jotai';
import { AnimatePresence, motion } from 'motion/react';
export type { DragEndEvent } from '@dnd-kit/core';

const BoardCards = ({
  id,
  children,
  className,
  items,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  id: string;
  children: React.ReactNode;
  className?: string;
  items: string[];
}) => {
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
          {children}
        </div>
      </SortableContext>
      <ScrollArea.Bar orientation="vertical" />
    </ScrollArea>
  );
};

const BoardCard = <T extends BoardItemProps = BoardItemProps>({
  id,
  children,
  className,
}: BoardCardProps<T>) => {
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
  const { boardId } = useContext(BoardContext) as BoardContextProps;
  const activeCardId = useAtomValue(activeCardIdState(boardId));
  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  return (
    <>
      <div style={style} {...listeners} {...attributes} ref={setNodeRef}>
        <div
          className={cn(
            'gap-4 rounded-lg shadow-sm outline-none bg-background',
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
                  'cursor-grab gap-4 rounded-lg bg-background',
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

const BoardProvider = <
  T extends BoardItemProps = BoardItemProps,
  C extends BoardColumnProps = BoardColumnProps,
>({
  children,
  onDragStart,
  onDragEnd,
  onDragOver,
  className,
  columns,
  data,
  onDataChange,
  boardId,
  ...props
}: BoardProviderProps<T, C>) => {
  const setActiveCardId = useSetAtom(activeCardIdState(boardId));
  const setDragOverBoardColumnId = useSetAtom(
    dragOverBoardColumnIdState(boardId),
  );

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
    if (!activeItem) {
      return;
    }
    const overItem = data.find((item) => item.id === over.id);
    if (overItem) {
      setDragOverBoardColumnId(overItem.column as string);
    } else {
      setDragOverBoardColumnId(null);
    }

    onDragOver?.(event);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCardId(null);
    setDragOverBoardColumnId(null);
    onDragEnd?.(event);
  };

  return (
    <BoardContext.Provider value={{ columns, data, boardId }}>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        onDragStart={handleDragStart}
        sensors={sensors}
        {...props}
      >
        <div
          className={cn(
            'flex flex-auto gap-4 overflow-x-auto p-5 pb-0 styled-scroll',
            className,
          )}
        >
          {columns.map((column) => children(column))}
        </div>
      </DndContext>
    </BoardContext.Provider>
  );
};

export const BoardHeader = ({ className, ...props }: BoardHeaderProps) => (
  <div
    className={cn(
      'm-0 px-2 h-10 flex-none font-semibold text-sm flex items-center justify-between',
      className,
    )}
    {...props}
  />
);

export const BoardRoot = ({
  id,
  children,
  className,
  sortBy,
}: BoardProps & { sortBy?: string }) => {
  const { boardId } = useContext(BoardContext) as BoardContextProps;
  const dragOverBoardColumnId = useAtomValue(
    dragOverBoardColumnIdState(boardId),
  );
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      className={cn(
        'flex size-full min-h-40 min-w-80 flex-col overflow-hidden transition-all bg-gradient-to-b from-[#e0e7ff] to-[#e0e7ff50] rounded-t-md dark:from-primary/40 dark:to-primary/20 relative',
        className,
      )}
      ref={setNodeRef}
    >
      {children}
      <AnimatePresence>
        {(isOver || dragOverBoardColumnId === id) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className="absolute inset-0 top-8 rounded-t-md bg-background/30 backdrop-blur-sm flex items-center justify-center"
          >
            Board ordered by
            <span className="font-medium capitalize ml-1">{sortBy}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Board = Object.assign(BoardRoot, {
  Provider: BoardProvider,
  Header: BoardHeader,
  Cards: BoardCards,
  Card: BoardCard,
});
