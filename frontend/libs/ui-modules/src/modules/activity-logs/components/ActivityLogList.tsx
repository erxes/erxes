import { IconActivity } from '@tabler/icons-react';
import { Empty, EnumCursorDirection, Skeleton } from 'erxes-ui';
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
    handleFetchMore,
    hasNextPage,
    hasPreviousPage,
    limit,
    variant = 'forward',
  } = useActivityLog();

  const reachedLimit = limit !== undefined && activityLogs.length >= limit;
  const canFetchMore = variant === 'backward' ? hasPreviousPage : hasNextPage;

  const { ref: fetchMoreRef } = useInView({
    threshold: 0.1,
    onChange: (inView) => {
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
    },
  });

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
      {variant === 'backward' && canFetchMore && !loading && !reachedLimit && (
        <div ref={fetchMoreRef} className="w-full flex flex-col gap-4">
          {new Array(4).map((_, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="w-1/2 h-3" />
              <Skeleton className="w-20 ml-auto h-3" />
            </div>
          ))}
        </div>
      )}
      {activityLogs.map((activity, index) => (
        <ActivityLogRow
          key={activity._id}
          activity={activity}
          isLast={index === activityLogs.length - 1}
        />
      ))}
      {variant === 'forward' && canFetchMore && !loading && !reachedLimit && (
        <div ref={fetchMoreRef} className="w-full flex flex-col gap-4">
          {new Array(4).map((_, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Skeleton className="size-6 rounded-full" />
              <Skeleton className="w-1/2 h-3" />
              <Skeleton className="w-20 ml-auto h-3" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
