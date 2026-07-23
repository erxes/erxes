import { IconActivity } from '@tabler/icons-react';
import {
  Button,
  Empty,
  EnumCursorDirection,
  Skeleton,
  Spinner,
} from 'erxes-ui';
import { useInView } from 'react-intersection-observer';
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
    loadingMore,
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
    limit,
    variant = 'forward',
    showExactDate,
    paginationMode = 'infinite',
    loadMoreLabel,
  } = useActivityLog();

  const reachedLimit = limit !== undefined && activityLogs.length >= limit;
  const canFetchMore = variant === 'backward' ? hasPreviousPage : hasNextPage;
  const fetchDirection =
    variant === 'backward'
      ? EnumCursorDirection.BACKWARD
      : EnumCursorDirection.FORWARD;

  const fetchMore = () => {
    if (!handleFetchMore || loading || loadingMore) {
      return;
    }

    handleFetchMore({ direction: fetchDirection });
  };

  const { ref: fetchMoreRef } = useInView({
    threshold: 0.1,
    onChange: (inView) => {
      if (inView && canFetchMore && !loading && !loadingMore && !reachedLimit) {
        fetchMore();
      }
    },
  });

  const fetchMoreControl =
    paginationMode === 'button' ? (
      <div className="flex w-full justify-center py-2">
        <Button
          variant="ghost"
          size="sm"
          className="bg-muted hover:bg-muted"
          onClick={fetchMore}
          disabled={loading || loadingMore}
        >
          {loadingMore && <Spinner size="sm" />}
          {loadMoreLabel || 'View more activities'}
        </Button>
      </div>
    ) : (
      <div ref={fetchMoreRef} className="w-full flex flex-col gap-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Skeleton className="size-6 rounded-full" />
            <Skeleton className="w-1/2 h-3" />
            <Skeleton className="w-20 ml-auto h-3" />
          </div>
        ))}
      </div>
    );

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

  return (
    <div className="w-full flex flex-col">
      {variant === 'backward' &&
        paginationMode !== 'button' &&
        canFetchMore &&
        !loading &&
        !reachedLimit &&
        fetchMoreControl}
      {activityLogs.map((activity, index) => (
        <ActivityLogRow
          key={activity._id}
          activity={activity}
          isLast={index === activityLogs.length - 1}
          showExactDate={showExactDate}
        />
      ))}
      {(variant === 'forward' || paginationMode === 'button') &&
        canFetchMore &&
        !loading &&
        !reachedLimit &&
        fetchMoreControl}
    </div>
  );
};
