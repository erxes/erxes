import type { OperationVariables } from '@apollo/client';
import { useActivities } from '@/activity-logs/hooks/useActivities';
import { ActivityItem } from '@/activity-logs/components/ActivityItem';
import { IActivityLog } from '@/activity-logs/types/activityTypes';

export const ActivityLogs = ({
  operation,
}: {
  operation?: OperationVariables;
}) => {
  const { activityLogs, loading, error } = useActivities(operation);

  if (loading) return <div className="p-5">Loading...</div>;

  if (error)
    return <div className="p-5 text-destructive">Error: {error.message}</div>;

  if (activityLogs?.length === 0)
    return (
      <div className="p-12 text-muted-foreground/50 text-center">
        No activity
      </div>
    );

  const contentTypeModule = operation?.variables?.contentType
    ? operation?.variables?.contentType.split(':')[1]
    : null;

  return (
    <div className="p-5">
      {activityLogs?.map((activity: IActivityLog, index: number) => (
        <ActivityItem
          key={activity._id}
          activity={activity}
          contentTypeModule={contentTypeModule}
          isLast={index === activityLogs.length - 1}
        />
      ))}
    </div>
  );
};
