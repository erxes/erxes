import { BaseBoardColumn, BaseBoardItem } from '@/deals/types/boards';
import React, { memo, useRef } from 'react';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import { IconGripVertical } from '@tabler/icons-react';
import { cn } from 'erxes-ui';
import { useDroppable } from '@dnd-kit/core';
import { useVirtualizer } from '@tanstack/react-virtual';

const ESTIMATED_CARD_HEIGHT = 100;

interface GenericBoardColumnProps<
  TItem extends BaseBoardItem,
  TColumn extends BaseBoardColumn,
> {
  column: TColumn;
  items: TItem[];
  renderCard: (item: TItem, isDragOverlay?: boolean) => React.ReactNode;
  renderColumnHeader?: (column: TColumn, itemCount: number) => React.ReactNode;
  className?: string;
  cardClassName?: string;
}

function GenericBoardColumnInner<
  TItem extends BaseBoardItem,
  TColumn extends BaseBoardColumn,
>({
  column,
  items,
  renderCard,
  renderColumnHeader,
  className,
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
        renderCard={renderCard}
      />
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

// Virtualized card list for performance
interface VirtualizedCardListProps<TItem extends BaseBoardItem> {
  columnId: string;
  items: TItem[];
  renderCard: (item: TItem, isDragOverlay?: boolean) => React.ReactNode;
}

function VirtualizedCardListInner<TItem extends BaseBoardItem>({
  columnId,
  items,
  renderCard,
}: VirtualizedCardListProps<TItem>) {
  const parentRef = useRef<HTMLDivElement>(null);

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

  const itemIds = items.map((item) => item.id);

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
                key={item.id}
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

      {items.length === 0 && (
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
    id: item.id,
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
          'bg-white rounded-lg border shadow-sm cursor-grab active:cursor-grabbing',
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
