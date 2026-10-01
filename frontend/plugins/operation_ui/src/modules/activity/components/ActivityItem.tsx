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
import { ActivityConvertToProject } from '@/activity/components/ActivityConvert';
import { useTranslation } from 'react-i18next';

export const ActivityItem = ({ activity }: { activity: IActivity }) => {
  const { t } = useTranslation('operation');
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
      return <div>{t('unknown-module')}</div>;
  }
};
