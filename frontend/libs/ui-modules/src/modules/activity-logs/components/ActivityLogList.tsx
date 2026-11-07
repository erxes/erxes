import { IconActivity } from '@tabler/icons-react';
import { Empty, EnumCursorDirection, Skeleton } from 'erxes-ui';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';
import { useActivityLog } from '../context/ActivityLogProvider';
import { ActivityLogLoading } from './ActivityLogLoading';
import { ActivityLogRow } from './ActivityLogRow';

export const ActivityLogList = ({
  emptyMessage,
}: {
  emptyMessage?: string;
}) => {
  const {
    activityLogs,
    loading,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
    limit,
    variant = 'forward',
    showExactDate,
  } = useActivityLog();

  const reachedLimit = limit !== undefined && activityLogs.length >= limit;
  const canFetchMore = variant === 'backward' ? hasPreviousPage : hasNextPage;

  const { ref: fetchMoreRef, inView } = useInView({
    threshold: 0.1,
  });

  useEffect(() => {
    if (
      inView &&
      canFetchMore &&
      handleFetchMore &&
      !loading &&
      !reachedLimit
    ) {
      handleFetchMore({
        direction:
          variant === 'backward'
            ? EnumCursorDirection.BACKWARD
            : EnumCursorDirection.FORWARD,
      });
    }
  }, [inView, canFetchMore, handleFetchMore, loading, reachedLimit, variant]);

  if (loading && (!activityLogs || activityLogs.length === 0)) {
    return <ActivityLogLoading />;
  }

  if (!activityLogs || activityLogs.length === 0) {
    return (
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconActivity />
          </Empty.Media>
          <Empty.Title>{emptyMessage || 'No activity logs found'}</Empty.Title>
          <Empty.Description>
            There seems to be no activity logs for this item.
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  const fetchMoreIndicator = canFetchMore && !reachedLimit && (
    <div
      ref={fetchMoreRef}
      className="w-full min-h-1 flex flex-col gap-4"
      role={loading ? 'status' : undefined}
      aria-label={loading ? 'Loading more activity logs' : undefined}
    >
      {loading &&
        [...Array(4)].map((_, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="w-1/2 h-3" />
            <Skeleton className="w-20 ml-auto h-3" />
          </div>
        ))}
    </div>
  );

  return (
    <div className="w-full flex flex-col">
      {variant === 'backward' && fetchMoreIndicator}
      {activityLogs.map((activity, index) => (
        <ActivityLogRow
          key={activity._id}
          activity={activity}
          isLast={index === activityLogs.length - 1}
          showExactDate={showExactDate}
        />
      ))}
      {variant === 'forward' && fetchMoreIndicator}
    </div>
  );
};
