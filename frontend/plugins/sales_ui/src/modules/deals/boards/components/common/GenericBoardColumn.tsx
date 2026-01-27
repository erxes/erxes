import {
  BaseBoardColumn,
  BaseBoardItem,
  GenericBoardColumnProps,
  VirtualizedCardListProps,
} from '@/deals/types/boards';
import React, { memo, useCallback, useEffect, useRef } from 'react';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Spinner, cn } from 'erxes-ui';

import { CSS } from '@dnd-kit/utilities';
import { CardsLoading } from '@/deals/components/loading/CardsLoading';
import { IconGripVertical } from '@tabler/icons-react';
import { useColumnLoading } from '@/deals/states/dealsBoardState';
import { useDroppable } from '@dnd-kit/core';
import { useVirtualizer } from '@tanstack/react-virtual';

const ESTIMATED_CARD_HEIGHT = 100;
const SCROLL_THRESHOLD = 200;

function GenericBoardColumnInner<
  TItem extends BaseBoardItem,
  TColumn extends BaseBoardColumn,
>({
  column,
  items,
  renderCard,
  renderColumnHeader,
  className,
  hasMore,
  isLoadingMore,
  onLoadMore,
  totalCount,
}: GenericBoardColumnProps<TItem, TColumn>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column._id,
    data: { type: 'column', column },
  });
  const [columnLoading] = useColumnLoading();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex flex-col shrink-0 transition-all bg-gradient-to-b from-[#e0e7ff] to-[#e0e7ff50] rounded-lg w-80 overflow-hidden dark:from-primary/40 dark:to-primary/20 relative
        ${isDragging ? 'opacity-50 shadow-lg' : ''}
        ${className || ''}
      `}
    >
      <div className="flex items-center px-2 min-h-10">
        <button
          className="cursor-grab hover:bg-accent rounded"
          {...attributes}
          {...listeners}
        >
          <IconGripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {renderColumnHeader ? (
          renderColumnHeader(column, items.length)
        ) : (
          <DefaultColumnHeader title={column.name} count={items.length} />
        )}
      </div>

      <VirtualizedCardList
        columnId={column._id}
        items={items}
        isLoading={columnLoading[column._id]}
        renderCard={renderCard}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={onLoadMore}
      />

      {totalCount !== undefined && totalCount > items.length && (
        <div className="px-3 py-1.5 text-xs text-muted-foreground border-t border-border/50 text-center">
          Showing {items.length} of {totalCount}
        </div>
      )}
    </div>
  );
}

const DefaultColumnHeader = memo(
  ({ title, count }: { title: string; count: number }) => (
    <div className="flex items-center justify-between flex-1">
      <span className="font-medium text-sm">{title}</span>
      <span className="text-xs text-muted-foreground bg-background px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  ),
);
DefaultColumnHeader.displayName = 'DefaultColumnHeader';

function VirtualizedCardListInner<TItem extends BaseBoardItem>({
  columnId,
  items,
  renderCard,
  hasMore: hasMoreProp,
  isLoadingMore: isLoadingMoreProp,
  onLoadMore,
  isLoading = false,
}: VirtualizedCardListProps<TItem>) {
  const hasMore = hasMoreProp ?? true;
  const isLoadingMore = isLoadingMoreProp ?? false;
  const parentRef = useRef<HTMLDivElement>(null);
  const loadingRef = useRef(false);

  const { setNodeRef, isOver } = useDroppable({
    id: `${columnId}-droppable`,
    data: { type: 'column', columnId },
  });

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ESTIMATED_CARD_HEIGHT,
    overscan: 5,
    measureElement: (el) => el.getBoundingClientRect().height,
  });

  const handleScroll = useCallback(() => {
    if (
      !parentRef.current ||
      !hasMore ||
      isLoadingMore ||
      loadingRef.current ||
      !onLoadMore
    ) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = parentRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    if (distanceFromBottom < SCROLL_THRESHOLD) {
      loadingRef.current = true;
      onLoadMore();
    }
  }, [hasMore, isLoadingMore, onLoadMore]);

  useEffect(() => {
    if (!isLoadingMore) {
      loadingRef.current = false;
    }
  }, [isLoadingMore]);

  useEffect(() => {
    const scrollElement = parentRef.current;
    if (!scrollElement) return;

    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const itemIds = items.map((item) => item._id);

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        (parentRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
      }}
      className="flex-1 overflow-auto p-2 pt-0"
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div
          className="relative w-full"
          style={{ height: `${virtualizer.getTotalSize()}px` }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const item = items[virtualRow.index];
            return (
              <SortableCard
                key={item._id}
                item={item}
                renderCard={renderCard}
                virtualStart={virtualRow.start}
                measureRef={virtualizer.measureElement}
                index={virtualRow.index}
              />
            );
          })}
        </div>
      </SortableContext>

      {isLoadingMore && (
        <div className="flex items-center justify-center py-3 text-muted-foreground">
          <Spinner />
        </div>
      )}

      {isLoading && <CardsLoading />}

      {items.length === 0 && !isLoadingMore && !isLoading && (
        <div
          className={`
            border-2 border-dashed bg-white/80 rounded-lg text-muted-foreground
            min-h-[100px] p-4 flex items-center justify-center text-sm
            ${isOver ? 'border-primary bg-primary/5' : 'border-muted'}
          `}
        >
          Drop cards here!
        </div>
      )}
    </div>
  );
}

// Sortable card wrapper
interface SortableCardProps<TItem extends BaseBoardItem> {
  item: TItem;
  renderCard: (item: TItem, isDragOverlay?: boolean) => React.ReactNode;
  virtualStart: number;
  measureRef: (el: HTMLElement | null) => void;
  index: number;
}

function SortableCardInner<TItem extends BaseBoardItem>({
  item,
  renderCard,
  virtualStart,
  measureRef,
  index,
}: SortableCardProps<TItem>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item._id,
    data: { type: 'card', item },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        measureRef(node);
      }}
      data-index={index}
      className="absolute left-0 w-full pb-2"
      style={{
        ...style,
        top: `${virtualStart}px`,
      }}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'bg-white rounded-lg border shadow-sm cursor-grab overflow-hidden active:cursor-grabbing',
          'hover:shadow-md hover:border-primary/50 transition-all duration-150',
          isDragging && 'opacity-40 shadow-lg',
        )}
      >
        {renderCard(item, false)}
      </div>
    </div>
  );
}

const SortableCard = memo(SortableCardInner) as typeof SortableCardInner;
const VirtualizedCardList = memo(
  VirtualizedCardListInner,
) as typeof VirtualizedCardListInner;
export const GenericBoardColumn = memo(
  GenericBoardColumnInner,
) as typeof GenericBoardColumnInner;
