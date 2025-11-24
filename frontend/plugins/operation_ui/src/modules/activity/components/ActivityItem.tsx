import { ActivityAssignee } from '@/activity/components/ActivityAssignee';
import { ActivityCycle } from '@/activity/components/ActivityCycle';
import { ActivityDate } from '@/activity/components/ActivityDate';
import { ActivityEstimate } from '@/activity/components/ActivityEstimate';
import { ActivityLead } from '@/activity/components/ActivityLead';
import { ActivityMilestone } from '@/activity/components/ActivityMilestone';
import { ActivityNote } from '@/activity/components/ActivityNote';
import { ActivityPriority } from '@/activity/components/ActivityPriority';
import { ActivityStatus } from '@/activity/components/ActivityStatus';
import { ActivityTeam } from '@/activity/components/ActivityTeam';
import { Name } from '@/activity/components/Name';
import { ACTIVITY_MODULES } from '@/activity/constants';
import { IActivity } from '@/activity/types';
import {
  IconAlertSquareRounded,
  IconCalendar,
  IconLabel,
  IconNote,
  IconProgressCheck,
  IconQuestionMark,
  IconSquareRotated,
  IconUsersGroup,
} from '@tabler/icons-react';
import { MembersInline } from 'ui-modules';
import { ActivityConvertToProject } from '@/activity/components/ActivityConvert';

export const ActivityItem = ({ activity }: { activity: IActivity }) => {
  const { metadata, action } = activity;

  switch (activity.module) {
    case ACTIVITY_MODULES.NAME:
      return <Name metadata={metadata} />;
    case ACTIVITY_MODULES.STATUS:
      return <ActivityStatus metadata={metadata} />;
    case ACTIVITY_MODULES.LEAD:
      return <ActivityLead metadata={metadata} />;
    case ACTIVITY_MODULES.PRIORITY:
      return <ActivityPriority metadata={metadata} />;
    case ACTIVITY_MODULES.TEAM:
      return <ActivityTeam metadata={metadata} />;
    case ACTIVITY_MODULES.START_DATE:
      return <ActivityDate metadata={metadata} type="start" />;
    case ACTIVITY_MODULES.END_DATE:
      return <ActivityDate metadata={metadata} type="end" />;
    case ACTIVITY_MODULES.ASSIGNEE:
      return <ActivityAssignee metadata={metadata} />;
    case ACTIVITY_MODULES.NOTE:
      return <ActivityNote action={action} />;
    case ACTIVITY_MODULES.ESTIMATE_POINT:
      return <ActivityEstimate metadata={metadata} action={action} />;
    case ACTIVITY_MODULES.CYCLE:
      return <ActivityCycle metadata={metadata} action={action} />;
    case ACTIVITY_MODULES.MILESTONE:
      return <ActivityMilestone metadata={metadata} action={action} />;
    case ACTIVITY_MODULES.CONVERT:
      return <ActivityConvertToProject metadata={metadata} action={action} />;
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
    case ACTIVITY_MODULES.TEAM:
      return <IconUsersGroup className="size-4 text-accent-foreground" />;
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

    case ACTIVITY_MODULES.ESTIMATE_POINT:
      return (
        <IconAlertSquareRounded className="size-4 text-accent-foreground" />
      );
    case ACTIVITY_MODULES.MILESTONE:
      return <IconSquareRotated className="size-4 text-accent-foreground" />;
    default:
      return <IconQuestionMark className="size-4 text-accent-foreground" />;
  }
};
