import { IActivity } from '@/activity/types';
import {
  ActivityIcon,
  ActivityItem as ActivityItemContent,
} from '@/activity/components/ActivityItem';
import { ActivityAuthorName } from '@/activity/components/ActivityAuthor';
import { ActivityTimelineItem } from '@/activity/components/ActivityTimelineItem';
import { useTranslation } from 'react-i18next';

interface ActivityItemWrapperProps {
  activity: IActivity;
}

export const ActivityItemWrapper = ({ activity }: ActivityItemWrapperProps) => {
  const { t } = useTranslation('frontline');

  return (
    <ActivityTimelineItem
      avatar={<ActivityIcon activity={activity} />}
      createdAt={activity.createdAt?.toLocaleString()}
      id={activity._id}
    >
      {activity.createdBy === 'system' ? (
        <div className="text-accent-foreground">{t('system', 'System')}</div>
      ) : (
        <ActivityAuthorName
          createdBy={activity.createdBy}
          className="font-semibold"
        />
      )}
      <ActivityItemContent activity={activity} />
    </ActivityTimelineItem>
  );
};
