import { useActivities } from '@/activity/hooks/useActivities';
import { ActivityIcon, ActivityItem } from '@/activity/components/ActivityItem';
import { MembersInline } from 'ui-modules';
import { RelativeDateDisplay } from 'erxes-ui';
import { ITask } from '@/task/types';
import { IProject } from '@/project/types';
import { ActivityListProvider } from '@/activity/context/ActivityListContext';
import { ACTIVITY_MODULES } from '@/activity/constants';
import { NoteInputReadOnly } from '@/activity/components/NoteInputReadOnly';
import { NoteInput } from '@/activity/components/NoteInput';

export const ActivityList = ({
  contentId,
  contentDetail,
}: {
  contentId: string;
  contentDetail: ITask | IProject;
}) => {
  const { activities, loading } = useActivities(contentId);

  if (loading) {
    return;
  }

  return (
    <div className="flex flex-col mb-12 gap-4">
      <ActivityListProvider contentDetail={contentDetail}>
        <div className="ml-2.5 relative before:absolute before:left-0 before:top-1 before:bottom-1 before:w-px before:bg-muted before:-translate-x-1/2  flex flex-col gap-6">
          {activities?.map((activity) =>
            activity.module === ACTIVITY_MODULES.TEAM ? null : (
              <div className="flex flex-col gap-2" key={activity._id}>
                <div className="inline-flex gap-1">
                  <div className="size-5 -ml-2.5 mt-0.5 shadow-xs rounded-full bg-background relative flex items-center justify-center">
                    <ActivityIcon activity={activity} />
                  </div>
                  <div className="inline-flex gap-1 text-sm leading-6 flex-wrap">
                    <div className="ml-1">
                      {activity.createdBy && activity.createdBy === 'system' ? (
                        <div className="text-accent-foreground">System</div>
                      ) : (
                        <MembersInline.Provider
                          memberIds={
                            activity.createdBy ? [activity.createdBy] : []
                          }
                        >
                          <MembersInline.Title />
                        </MembersInline.Provider>
                      )}
                    </div>
                    <ActivityItem activity={activity} />
                    <RelativeDateDisplay
                      value={activity.createdAt?.toLocaleString()}
                      key={activity._id}
                      asChild
                    >
                      <div className="text-accent-foreground ml-2 cursor-default">
                        <RelativeDateDisplay.Value
                          value={activity.createdAt?.toLocaleString()}
                        />
                      </div>
                    </RelativeDateDisplay>
                  </div>
                </div>
                {activity.module === ACTIVITY_MODULES.NOTE && (
                  <NoteInputReadOnly
                    key={activity._id}
                    newValueId={activity.metadata?.newValue}
                  />
                )}
              </div>
            ),
          )}
        </div>
      </ActivityListProvider>
      <span className="ml-2.5 mb-6">
        <NoteInput contentId={contentId} />
      </span>
    </div>
  );
};
