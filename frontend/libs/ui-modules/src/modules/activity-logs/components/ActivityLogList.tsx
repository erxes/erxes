import { ActivityLogRow } from './ActivityLogRow';
import { ActivityLogLoading } from './ActivityLogLoading';
import { useActivityLog } from '../context/ActivityLogProvider';
import { EnumCursorDirection } from 'erxes-ui';
import { useInView } from 'react-intersection-observer';
import { Skeleton } from 'erxes-ui';

interface ActivityLogListProps {
  emptyMessage?: string;
}

export const ActivityLogList = ({
  emptyMessage = 'No activity logs found',
}: ActivityLogListProps) => {
  const { activityLogs, loading, handleFetchMore, hasNextPage } =
    useActivityLog();

  const { ref: fetchMoreRef } = useInView({
    threshold: 0.1,
    onChange: (inView) => {
      if (inView && hasNextPage && handleFetchMore && !loading) {
        handleFetchMore({ direction: EnumCursorDirection.FORWARD });
      }
    },
  });

  if (loading) {
    return <ActivityLogLoading />;
  }

  if (!activityLogs || activityLogs.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px]">
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      {activityLogs.map((activity, index) => (
        <ActivityLogRow
          key={activity._id}
          activity={activity}
          isLast={index === activityLogs.length - 1}
        />
      ))}
      {hasNextPage && !loading && (
        <div ref={fetchMoreRef} className="w-full py-2">
          <Skeleton className="h-16 w-full" />
        </div>
      )}
    </div>
  );
};
