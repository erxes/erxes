import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';
import { IActivity } from '@/activity/types';
import {
  ActivityIcon,
  ActivityItem as ActivityItemContent,
} from '@/activity/components/ActivityItem';
import { ActivityTimelineItem } from '@/activity/components/ActivityTimelineItem';
interface ActivityItemWrapperProps {
  activity: IActivity;
}

export const ActivityItemWrapper = ({ activity }: ActivityItemWrapperProps) => {
  const { t } = useTranslation('operation');
  const memberIds = activity.createdBy ? [activity.createdBy] : [];

  return (
    <ActivityTimelineItem
      avatar={<ActivityIcon activity={activity} />}
      createdAt={activity.createdAt?.toLocaleString()}
      id={activity._id}
    >
      {activity.createdBy === 'system' ? (
        <div className="text-accent-foreground">{t('system')}</div>
      ) : (
        <MembersInline.Provider memberIds={memberIds}>
          <MembersInline.Title />
        </MembersInline.Provider>
      )}
      <ActivityItemContent activity={activity} />
    </ActivityTimelineItem>
  );
};
