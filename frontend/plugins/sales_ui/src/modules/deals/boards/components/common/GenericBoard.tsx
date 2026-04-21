import { useState, useCallback, useMemo, memo, useEffect, useRef } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  closestCorners,
  pointerWithin,
  rectIntersection,
  getFirstCollision,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type CollisionDetection,
  type UniqueIdentifier,
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
  const stateRef = useRef(state);
  const [activeItem, setActiveItem] = useState<TItem | null>(null);
  const [activeColumn, setActiveColumn] = useState<TColumn | null>(null);
  const [snapshot, setSnapshot] = useState<typeof state | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  const updateState = useCallback(
    (updater: (prevState: typeof initialState) => typeof initialState) => {
      setState((prev) => {
        const nextState = updater(prev);
        stateRef.current = nextState;
        return nextState;
      });
    },
    [],
  );

  useEffect(() => {
    stateRef.current = initialState;
    setState(initialState);
  }, [initialState]);

  const findContainerId = useCallback(
    (
      id: UniqueIdentifier | null,
      boardState: typeof initialState = stateRef.current,
    ): string | null => {
      if (id == null) return null;

      const resolvedId = String(id);

      if (resolvedId in boardState.columnItems) {
        return resolvedId;
      }

      if (resolvedId.endsWith('-droppable')) {
        const columnId = resolvedId.slice(0, -'-droppable'.length);
        return columnId in boardState.columnItems ? columnId : null;
      }

      for (const [columnId, itemIds] of Object.entries(
        boardState.columnItems,
      )) {
        if (itemIds.includes(resolvedId)) {
          return columnId;
        }
      }

      return null;
    },
    [],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeColumn) {
        return closestCorners(args);
      }

      const currentState = stateRef.current;
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, 'id');

      if (overId != null) {
        const overContainerId = findContainerId(overId, currentState);
        const containerItems = overContainerId
          ? currentState.columnItems[overContainerId] || []
          : [];

        if (
          overContainerId &&
          containerItems.length > 0 &&
          (String(overId) === overContainerId ||
            String(overId) === `${overContainerId}-droppable`)
        ) {
          const closestItem = closestCenter({
            ...args,
            droppableContainers: args.droppableContainers.filter((container) =>
              containerItems.includes(String(container.id)),
            ),
          })[0]?.id;

          if (closestItem != null) {
            overId = closestItem;
          }
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeItem?._id ?? null;
      }

      return lastOverId.current != null ? [{ id: lastOverId.current }] : [];
    },
    [activeColumn, activeItem?._id, findContainerId],
  );

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [state.columnItems]);

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

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current;
      const overData = over.data.current;

      // Column reordering
      if (activeData?.type === 'column') {
        const overColumnId = findContainerId(over.id);

        if (!overColumnId) return;

        updateState((prev) => {
          const oldIndex = prev.columns.findIndex(
            (col) => col._id === active.id,
          );
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

      const activeId = active.id as string;

      updateState((prev) => {
        const activeColumnId = findContainerId(activeId, prev);
        const overColumnId = findContainerId(over.id, prev);

        if (!activeColumnId || !overColumnId || activeColumnId === overColumnId)
          return prev;

        const activeItems = [...(prev.columnItems[activeColumnId] || [])];
        const overItems = [...(prev.columnItems[overColumnId] || [])];

        const activeIndex = activeItems.indexOf(activeId);
        if (activeIndex === -1) return prev;
        activeItems.splice(activeIndex, 1);

        let insertIndex = overItems.length;
        if (overData?.type === 'card') {
          const overIndex = overItems.indexOf(String(over.id));
          if (overIndex !== -1) insertIndex = overIndex;
        }

        overItems.splice(insertIndex, 0, activeId);

        const updatedItem = { ...prev.items[activeId], columnId: overColumnId };

        recentlyMovedToNewContainer.current = true;

        return {
          ...prev,
          items: { ...prev.items, [activeId]: updatedItem as TItem },
          columnItems: {
            ...prev.columnItems,
            [activeColumnId]: activeItems,
            [overColumnId]: overItems,
          },
        };
      });
    },
    [findContainerId, updateState],
  );

  function getValidColumnId(over: any): string | null {
    return findContainerId(over?.id ?? null);
  }

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveItem(null);
      setActiveColumn(null);
      lastOverId.current = null;
      recentlyMovedToNewContainer.current = false;
      const activeData = active.data.current;

      if (
        !over ||
        !activeData?.type ||
        (activeData?.type === 'card' && !getValidColumnId(over))
      ) {
        if (snapshot) {
          stateRef.current = snapshot;
          setState(snapshot);
          setSnapshot(null);
        }
        return;
      }

      const draggedId =
        typeof active.id === 'string' ? active.id : String(active.id);

      if (activeData?.type === 'column') {
        onStateChange?.(stateRef.current, initialState);
        return;
      }

      if (activeData?.type === 'card') {
        const overData = over.data.current;
        const currentState = stateRef.current;
        let finalState = currentState;

        if (overData?.type === 'card' && active.id !== over.id) {
          const overId = String(over.id);
          const dragColumnId = Object.entries(currentState.columnItems).find(
            ([, ids]) => ids.includes(draggedId),
          )?.[0];
          const overColumnId = Object.entries(currentState.columnItems).find(
            ([, ids]) => ids.includes(overId),
          )?.[0];

          if (dragColumnId && dragColumnId === overColumnId) {
            const columnItems = [
              ...(currentState.columnItems[dragColumnId] || []),
            ];
            const oldIndex = columnItems.indexOf(draggedId);
            const newIndex = columnItems.indexOf(overId);

            if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
              finalState = {
                ...currentState,
                columnItems: {
                  ...currentState.columnItems,
                  [dragColumnId]: arrayMove(columnItems, oldIndex, newIndex),
                },
              };
            }
          }
        }

        if (finalState !== currentState) {
          stateRef.current = finalState;
          setState(finalState);
        }

        onStateChange?.(finalState, initialState, draggedId);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [onStateChange, initialState, snapshot],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
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
