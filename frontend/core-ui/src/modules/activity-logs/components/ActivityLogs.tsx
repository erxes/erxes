import type { OperationVariables } from '@apollo/client';
import { useActivities } from '@/activity-logs/hooks/useActivities';
import { ActivityItem } from '@/activity-logs/components/ActivityItem';
import { IActivityLog } from '@/activity-logs/types/activityTypes';
import { useTranslation } from 'react-i18next';

export const ActivityLogs = ({
  operation,
}: {
  operation?: OperationVariables;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'activity-logs' });
  const { activityLogs, loading, error } = useActivities(operation);

  if (loading) return <div className="p-5">{t('loading')}</div>;

  if (error)
    return (
      <div className="p-5 text-destructive">
        {t('error', { message: error.message })}
      </div>
    );

  if (activityLogs?.length === 0)
    return (
      <div className="p-12 text-muted-foreground/50 text-center">
        {t('no-activity')}
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
