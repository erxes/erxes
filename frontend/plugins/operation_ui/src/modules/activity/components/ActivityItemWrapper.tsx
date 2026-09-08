import { IActivity } from '@/activity/types';
import {
  ActivityIcon,
  ActivityItem as ActivityItemContent,
} from '@/activity/components/ActivityItem';
import { ActivityTimelineItem } from '@/activity/components/ActivityTimelineItem';
import { ActivityActor } from '@/activity/components/ActivityActor';
interface ActivityItemWrapperProps {
  activity: IActivity;
}

export const ActivityItemWrapper = ({ activity }: ActivityItemWrapperProps) => {
  return (
    <ActivityActor.Provider actorId={activity.createdBy}>
      <ActivityTimelineItem
        avatar={<ActivityIcon activity={activity} />}
        createdAt={activity.createdAt?.toLocaleString()}
        id={activity._id}
      >
        <ActivityActor.Name />
        <ActivityItemContent activity={activity} />
      </ActivityTimelineItem>
    </ActivityActor.Provider>
  );
};
