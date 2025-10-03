import { useContext, useEffect, useMemo } from 'react';

import { CardsLoading } from '../../loading/CardsLoading';
import { EnumCursorDirection } from 'erxes-ui';
import { IDeal } from '@/deals/types/deals';
import { KanbanCardsProps } from './types';
import { KanbanContext } from './KanbanContext';
import { KanbanContextProps } from './types';
import { SortableContext } from '@dnd-kit/sortable';
import { cn } from 'erxes-ui';
import { useDeals } from '@/deals/cards/hooks/useDeals';
import { useDroppable } from '@dnd-kit/core';
import { useInView } from 'react-intersection-observer';
import { useSearchParams } from 'react-router-dom';

export const KanbanCards = <T extends IDeal = IDeal>({
  id, // stage id
  className,
  children,
  ...props
}: KanbanCardsProps<T> & { id: string; className?: string }) => {
  const [searchParams] = useSearchParams();

  const { onDataChange, data } = useContext(
    KanbanContext,
  ) as KanbanContextProps<T>;

  const { ref: triggerRef, inView: isTriggerInView } = useInView({
    triggerOnce: true,
  });

  const { ref: loadMoreRef, inView: isLoadMoreVisible } = useInView({
    rootMargin: '200px',
    threshold: 0,
  });

  const ignoredKeys = ['boardId', 'pipelineId', 'salesItemId'];

  const queryVariables: Record<string, any> = {};

  for (const [key, value] of searchParams.entries()) {
    if (ignoredKeys.includes(key)) continue;

    try {
      const parsed = JSON.parse(value);
      queryVariables[key] = parsed;
    } catch {
      queryVariables[key] = value;
    }
  }

  const { list, loading, handleFetchMore, hasNextPage } = useDeals({
    variables: { stageId: id, ...queryVariables },
    skip: !isTriggerInView,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    if (isLoadMoreVisible && hasNextPage) {
      handleFetchMore({ direction: EnumCursorDirection.FORWARD });
    }
  }, [isLoadMoreVisible, hasNextPage, handleFetchMore]);

  useEffect(() => {
    if (!list) return;

    onDataChange((prevData: IDeal[]) => {
      const otherStages = prevData.filter((p) => p.stage?._id !== id);
      return [...otherStages, ...list];
    });
  }, [list, onDataChange, id]);

  const filteredData = useMemo(
    () => data.filter((item) => item.stage?._id === id),
    [data, id],
  );

  const items = useMemo(
    () => filteredData.map((item) => `card-${item._id}`),
    [filteredData],
  );

  const { setNodeRef } = useDroppable({
    id: `column-${id}`,
  });

  if (loading) {
    return <CardsLoading />;
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'overflow-auto flex-auto flex flex-col gap-2 px-2 pb-3',
        className,
      )}
      {...props}
    >
      <SortableContext items={items}>
        <div ref={triggerRef} className="space-y-2">
          {filteredData.map(children)}
          {hasNextPage && (
            <div ref={loadMoreRef}>
              <CardsLoading />
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
};
