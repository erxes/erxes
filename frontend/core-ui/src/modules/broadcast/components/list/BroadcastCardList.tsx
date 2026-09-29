import { Card, EnumCursorDirection, ScrollArea, Skeleton } from 'erxes-ui';
import { useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useMessages } from '../../hooks/useBroadcastMessages';
import { BroadcastCard, TBroadcastCardMessage } from './BroadcastCard';
import { BroadcastEmptyState, BroadcastErrorState } from './BroadcastStates';

const INITIAL_SKELETON_COUNT = 8;
const FETCH_MORE_SKELETON_COUNT = 4;

const BroadcastCardSkeleton = () => (
  <Card className="flex flex-col gap-4 border p-4">
    <Skeleton className="h-7 w-7 rounded-md" />
    <Skeleton className="h-4 w-2/3" />
    <Skeleton className="h-1 w-full" />
    <Skeleton className="h-3 w-1/2" />
  </Card>
);

/**
 * Mirrors the table's cursor skeleton: reaching the end of the grid fetches the
 * next page instead of asking for a click.
 */
const BroadcastCardsForwardSkeleton = ({
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
        <BroadcastCardSkeleton />
      </div>
      {Array.from({ length: FETCH_MORE_SKELETON_COUNT - 1 }).map((_, index) => (
        <BroadcastCardSkeleton key={index} />
      ))}
    </>
  );
};

export const BroadcastCardList = () => {
  const {
    messages = [],
    loading,
    error,
    refetch,
    pageInfo,
    handleFetchMore,
  } = useMessages();

  // Held in state so the observer re-registers once the viewport is mounted.
  const [scrollElement, setScrollElement] = useState<HTMLDivElement | null>(
    null,
  );

  if (error) {
    return <BroadcastErrorState error={error} onRetry={() => refetch()} />;
  }

  if (!loading && !messages.length) {
    return <BroadcastEmptyState />;
  }

  return (
    <ScrollArea.Root className="h-full w-full">
      <ScrollArea.Viewport ref={setScrollElement}>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(18rem,1fr))] gap-3 p-3">
          {messages.map((message: TBroadcastCardMessage) => (
            <BroadcastCard key={message._id} message={message} />
          ))}
          {loading &&
            Array.from({ length: INITIAL_SKELETON_COUNT }).map((_, index) => (
              <BroadcastCardSkeleton key={index} />
            ))}
          {pageInfo?.hasNextPage && !loading && (
            <BroadcastCardsForwardSkeleton
              root={scrollElement}
              handleFetchMore={handleFetchMore}
            />
          )}
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Bar orientation="vertical" />
    </ScrollArea.Root>
  );
};
