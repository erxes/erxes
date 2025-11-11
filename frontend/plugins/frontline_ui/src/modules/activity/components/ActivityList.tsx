import { ITicket } from '@/ticket/types';
import { ActivityListProvider } from '@/activity/context/ActivityListContext';
import { ACTIVITY_MODULES } from '@/activity/constants';
import { NoteInputReadOnly } from '@/activity/components/NoteInputReadOnly';
import { NoteInput } from '@/activity/components/NoteInput';
import { CreatorInfo } from '@/activity/components/CreatorInfo';
import { ActivityItemWrapper } from '@/activity/components/ActivityItemWrapper';
import { useActivities } from '@/activity/hooks/useActivities';

export const ActivityList = ({
  contentId,
  contentDetail,
}: {
  contentId: string;
  contentDetail: ITicket;
}) => {
  const { activities, loading } = useActivities(contentId);
  if (loading) {
    return;
  }

  return (
    <div className="flex flex-col mb-12 gap-4">
      <ActivityListProvider contentDetail={contentDetail}>
        <div className="ml-2.5 relative before:absolute before:left-0 before:top-1 before:bottom-1 before:w-px before:bg-muted before:-translate-x-1/2  flex flex-col gap-6">
          <CreatorInfo contentDetail={contentDetail} />
          {activities?.map((activity) => (
            <div className="flex flex-col gap-2" key={activity._id}>
              <ActivityItemWrapper activity={activity} />
              {activity.module === ACTIVITY_MODULES.NOTE && (
                <NoteInputReadOnly
                  key={activity._id}
                  newValueId={activity.metadata?.newValue}
                />
              )}
            </div>
          ))}
        </div>
      </ActivityListProvider>
      <span className="ml-2.5 mb-6">
        <NoteInput contentId={contentId} />
      </span>
    </div>
  );
};
