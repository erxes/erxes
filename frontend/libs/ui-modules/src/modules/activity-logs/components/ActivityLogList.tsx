import { IconActivity } from '@tabler/icons-react';
import { Empty, EnumCursorDirection, SkeletonArray } from 'erxes-ui';
import { useInView } from 'react-intersection-observer';
import { useActivityLog } from '../context/ActivityLogProvider';
import { ActivityLogLoading } from './ActivityLogLoading';
import { ActivityLogRow } from './ActivityLogRow';

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
      <Empty>
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconActivity />
          </Empty.Media>
          <Empty.Title>No activity logs found</Empty.Title>
          <Empty.Description>
            There seems to be no activity logs for this item.
          </Empty.Description>
        </Empty.Header>
      </Empty>
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
          <SkeletonArray count={4} className="h-4 w-full" />
        </div>
      )}
    </div>
  );
};
