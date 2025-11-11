import { ActivityAssignee } from '@/activity/components/ActivityAssignee';
import { ActivityDate } from '@/activity/components/ActivityDate';
import { ActivityNote } from '@/activity/components/ActivityNote';
import { ActivityPriority } from '@/activity/components/ActivityPriority';
import { ActivityStatus } from '@/activity/components/ActivityStatus';
import { ActivityDescription } from '@/activity/components/ActivityDescription';
import { Name } from '@/activity/components/Name';
import { ACTIVITY_MODULES } from '@/activity/constants';
import { IActivity } from '@/activity/types';
import {
  IconAlertSquareRounded,
  IconCalendar,
  IconFileDescription,
  IconLabel,
  IconNote,
  IconProgressCheck,
  IconQuestionMark,
} from '@tabler/icons-react';
import { MembersInline } from 'ui-modules';

export const ActivityItem = ({ activity }: { activity: IActivity }) => {
  const { metadata, action } = activity;

  switch (activity.module) {
    case ACTIVITY_MODULES.NAME:
      return <Name metadata={metadata} />;
    case ACTIVITY_MODULES.STATUS:
      return <ActivityStatus metadata={metadata} />;
    case ACTIVITY_MODULES.PRIORITY:
      return <ActivityPriority metadata={metadata} />;
    case ACTIVITY_MODULES.START_DATE:
      return <ActivityDate metadata={metadata} type="start" />;
    case ACTIVITY_MODULES.END_DATE:
      return <ActivityDate metadata={metadata} type="end" />;
    case ACTIVITY_MODULES.ASSIGNEE:
      return <ActivityAssignee metadata={metadata} />;
    case ACTIVITY_MODULES.NOTE:
      return <ActivityNote action={action} />;
    case ACTIVITY_MODULES.DESCRIPTION:
      return <ActivityDescription />;
    default:
      return <div>Unknown module</div>;
  }
};

export const ActivityIcon = ({ activity }: { activity: IActivity }) => {
  switch (activity.module) {
    case ACTIVITY_MODULES.NAME:
      return <IconLabel className="size-4 text-accent-foreground" />;
    case ACTIVITY_MODULES.STATUS:
      return <IconProgressCheck className="size-4 text-accent-foreground" />;

    case ACTIVITY_MODULES.PRIORITY:
      return (
        <IconAlertSquareRounded
          className="size-4 
      text-accent-foreground"
        />
      );

    case ACTIVITY_MODULES.START_DATE:
      return <IconCalendar className="size-4 text-accent-foreground" />;
    case ACTIVITY_MODULES.END_DATE:
      return <IconCalendar className="size-4 text-accent-foreground" />;
    case ACTIVITY_MODULES.ASSIGNEE:
      return (
        <MembersInline.Provider
          memberIds={
            activity.metadata?.newValue ? [activity.metadata.newValue] : []
          }
        >
          <MembersInline.Avatar />
        </MembersInline.Provider>
      );
    case ACTIVITY_MODULES.NOTE:
      return <IconNote className="size-4 text-accent-foreground" />;
    case ACTIVITY_MODULES.DESCRIPTION:
      return <IconFileDescription className="size-4 text-accent-foreground" />;
    default:
      return <IconQuestionMark className="size-4 text-accent-foreground" />;
  }
};
