import { useState, useCallback, useMemo, memo, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { GenericBoardColumn } from './GenericBoardColumn';
import {
  BaseBoardItem,
  BaseBoardColumn,
  GenericBoardProps,
} from '@/deals/types/boards';

function GenericBoardInner<
  TItem extends BaseBoardItem,
  TColumn extends BaseBoardColumn,
>({
  initialState,
  onStateChange,
  onDragStart: onDragStartProp,
  renderCard,
  renderColumnHeader,
  columnClassName,
  cardClassName,
  columnPagination,
  onLoadMore,
}: GenericBoardProps<TItem, TColumn>) {
  const [state, setState] = useState(initialState);
  const [activeItem, setActiveItem] = useState<TItem | null>(null);
  const [activeColumn, setActiveColumn] = useState<TColumn | null>(null);
  const [snapshot, setSnapshot] = useState<typeof state | null>(null);

  useEffect(() => {
    setState(initialState);
  }, [initialState]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const columnIds = useMemo(
    () => state.columns.map((col) => col._id),
    [state.columns],
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event;
      const activeData = active.data.current;

      if (activeData?.type === 'column') {
        setActiveColumn(activeData.column as TColumn);
      } else if (activeData?.type === 'card') {
        const item = activeData.item as TItem;
        setActiveItem(item);
        onDragStartProp?.(item._id);

        setSnapshot({
          columns: state.columns,
          items: { ...state.items },
          columnItems: { ...state.columnItems },
        });
      }
    },
    [onDragStartProp, state],
  );

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Column reordering
    if (activeData?.type === 'column') {
      const overColumnId = (() => {
        if (overData?.type === 'column') return overData.column?.id;
        if (overData?.columnId) return overData.columnId;
        if (overData?.type === 'card') return (overData.item as TItem).columnId;
        if (typeof over.id === 'string' && over.id.endsWith('-droppable')) {
          return over.id.slice(0, -'-droppable'.length);
        }
        return typeof over.id === 'string' ? over.id : null;
      })();

      if (!overColumnId) return;

      setState((prev) => {
        const oldIndex = prev.columns.findIndex((col) => col._id === active.id);
        const newIndex = prev.columns.findIndex(
          (col) => col._id === overColumnId,
        );
        if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex)
          return prev;
        return {
          ...prev,
          columns: arrayMove(prev.columns, oldIndex, newIndex),
        };
      });
      return;
    }

    // Card movement between columns
    if (activeData?.type !== 'card') return;

    const activeItem = activeData.item as TItem;
    const activeColumnId = activeItem.columnId;

    let overColumnId: string;
    if (overData?.type === 'column') {
      overColumnId = overData.columnId;
    } else if (overData?.type === 'card') {
      overColumnId = (overData.item as TItem).columnId;
    } else {
      return;
    }

    if (activeColumnId === overColumnId) return;

    setState((prev) => {
      const activeItems = [...(prev.columnItems[activeColumnId] || [])];
      const overItems = [...(prev.columnItems[overColumnId] || [])];

      const activeIndex = activeItems.indexOf(activeItem._id);
      if (activeIndex === -1) return prev;
      activeItems.splice(activeIndex, 1);

      let insertIndex = overItems.length;
      if (overData?.type === 'card') {
        const overItem = overData.item as TItem;
        const overIndex = overItems.indexOf(overItem._id);
        if (overIndex !== -1) insertIndex = overIndex;
      }

      overItems.splice(insertIndex, 0, activeItem._id);

      const updatedItem = { ...activeItem, columnId: overColumnId };

      return {
        ...prev,
        items: { ...prev.items, [activeItem._id]: updatedItem },
        columnItems: {
          ...prev.columnItems,
          [activeColumnId]: activeItems,
          [overColumnId]: overItems,
        },
      };
    });
  }, []);

  function getValidColumnId(over: any): string | null {
    const overData = over.data.current;
    if (!overData) return null;

    if (overData?.type === 'column')
      return overData.columnId || overData.column?._id || null;
    if (overData?.type === 'card')
      return (overData.item as TItem).columnId || null;
    if (typeof over.id === 'string' && over.id.endsWith('-droppable'))
      return over.id.replace('-droppable', '');

    return null;
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveItem(null);
      setActiveColumn(null);
      const activeData = active.data.current;

      if (
        !over ||
        !activeData?.type ||
        (activeData?.type === 'card' && !getValidColumnId(over))
      ) {
        if (snapshot) {
          setState(snapshot);
          setSnapshot(null);
        }
        setActiveItem(null);
        setActiveColumn(null);
        return;
      }

      const overData = over.data.current;
      const draggedId =
        typeof active.id === 'string' ? active.id : String(active.id);

      if (activeData?.type === 'column') {
        setState((prev) => {
          onStateChange?.(prev, initialState);
          return prev;
        });
        return;
      }

      // Card reordering within same column
      if (activeData?.type === 'card' && overData?.type === 'card') {
        const activeItem = activeData.item as TItem;
        const overItem = overData.item as TItem;

        if (
          activeItem.columnId === overItem.columnId &&
          active.id !== over.id
        ) {
          setState((prev) => {
            const columnId = activeItem.columnId;
            const columnItems = [...(prev.columnItems[columnId] || [])];
            const oldIndex = columnItems.indexOf(activeItem._id);
            const newIndex = columnItems.indexOf(overItem._id);

            if (oldIndex !== -1 && newIndex !== -1) {
              const newColumnItems = arrayMove(columnItems, oldIndex, newIndex);
              const newState = {
                ...prev,
                columnItems: {
                  ...prev.columnItems,
                  [columnId]: newColumnItems,
                },
              };
              onStateChange?.(newState, initialState, draggedId);
              return newState;
            }
            return prev;
          });
        }
      }

      onStateChange?.(state, initialState, draggedId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onStateChange, state, initialState, snapshot],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex h-full gap-4 p-4 overflow-x-auto">
        <SortableContext
          items={columnIds}
          strategy={horizontalListSortingStrategy}
        >
          {state.columns.map((column) => {
            const items = (state.columnItems[column._id] || [])
              .map((id) => state.items[id])
              .filter(Boolean);

            const pagination = columnPagination?.[column._id];

            return (
              <GenericBoardColumn
                key={column._id}
                column={column}
                items={items}
                renderCard={renderCard}
                renderColumnHeader={renderColumnHeader}
                className={columnClassName}
                cardClassName={cardClassName}
                hasMore={pagination?.hasMore}
                isLoadingMore={pagination?.isLoading}
                totalCount={pagination?.totalCount}
                onLoadMore={
                  onLoadMore ? () => onLoadMore(column._id) : undefined
                }
              />
            );
          })}
        </SortableContext>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeColumn && renderColumnHeader && (
          <div className="bg-muted/80 rounded-lg p-4 shadow-lg opacity-90 min-w-[280px]">
            {renderColumnHeader(
              activeColumn,
              state.columnItems[activeColumn._id]?.length || 0,
            )}
          </div>
        )}
        {activeItem && (
          <div className="bg-white rounded-lg border-2 border-primary shadow-2xl p-3 rotate-3">
            {renderCard(activeItem, true)}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export const GenericBoard = memo(GenericBoardInner) as typeof GenericBoardInner;
