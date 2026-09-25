import { AutomationCard } from '@/automations/components/list/AutomationCard';
import { AutomationExecutionCountsLoader } from '@/automations/components/list/AutomationExecutionCountCell';
import { IAutomation } from '@/automations/types';
import { Card, EnumCursorDirection, ScrollArea, Skeleton } from 'erxes-ui';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';

const INITIAL_SKELETON_COUNT = 8;
const FETCH_MORE_SKELETON_COUNT = 4;

const AutomationCardSkeleton = () => (
  <Card className="flex flex-col gap-3 border p-4">
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-[3.25rem] w-full" />
    <Skeleton className="h-3 w-1/3" />
  </Card>
);

/**
 * Mirrors the table's cursor skeleton: reaching the end of the grid fetches the
 * next page instead of asking for a click.
 */
const AutomationCardsForwardSkeleton = ({
  root,
  handleFetchMore,
}: {
  root: Element | null;
  handleFetchMore: ({ direction }: { direction: EnumCursorDirection }) => void;
}) => {
  const { ref } = useInView({
    root,
    onChange: (inView) =>
      inView && handleFetchMore({ direction: EnumCursorDirection.FORWARD }),
  });

  return (
    <>
      <div ref={ref}>
        <AutomationCardSkeleton />
      </div>
      {Array.from({ length: FETCH_MORE_SKELETON_COUNT - 1 }).map((_, index) => (
        <AutomationCardSkeleton key={index} />
      ))}
    </>
  );
};

export const AutomationsCardList = ({
  list,
  loading,
  hasNextPage,
  handleFetchMore,
}: {
  list: IAutomation[];
  loading: boolean;
  hasNextPage?: boolean;
  handleFetchMore: ({ direction }: { direction: EnumCursorDirection }) => void;
}) => {
  // Held in state so the observer re-registers once the viewport is mounted.
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );

  return (
    <>
      <AutomationExecutionCountsLoader
        automationIds={list.map(({ _id }) => _id)}
      />
      <ScrollArea.Root className="h-full w-full">
        <ScrollArea.Viewport ref={setScrollElement}>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-3 p-3">
            {list.map((automation) => (
              <AutomationCard key={automation._id} automation={automation} />
            ))}
            {loading &&
              Array.from({ length: INITIAL_SKELETON_COUNT }).map((_, index) => (
                <AutomationCardSkeleton key={index} />
              ))}
            {hasNextPage && !loading && (
              <AutomationCardsForwardSkeleton
                root={scrollElement}
                handleFetchMore={handleFetchMore}
              />
            )}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Bar orientation="vertical" />
      </ScrollArea.Root>
    </>
  );
};
