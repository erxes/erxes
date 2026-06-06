import { Badge } from 'erxes-ui';
import { TActivityLog } from '../types';
import { ActivityLogActorName } from './ActivityLogActor';

const PERMISSION_GROUP_ACTIVITY_TYPES = [
  'permission_group.assigned',
  'permission_group.unassigned',
] as const;

const PERMISSION_GROUP_ACTIVITY_LABELS: Record<string, string> = {
  'permission_group.assigned': 'assigned permission group',
  'permission_group.unassigned': 'removed permission group',
};

const getPermissionGroupRawLabels = (
  activity: TActivityLog,
  actionType?: string,
) => {
  if (actionType === 'assigned') {
    return activity.changes?.added?.labels;
  }

  if (actionType === 'unassigned') {
    return activity.changes?.removed?.labels;
  }

  return undefined;
};

const getPermissionGroupContextLabels = (activity: TActivityLog) => {
  if (!activity.context?.text) {
    return [];
  }

  return activity.context.text
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean);
};

const getPermissionGroupDisplayLabels = (
  activity: TActivityLog,
  actionType?: string,
) => {
  const rawLabels = getPermissionGroupRawLabels(activity, actionType);

  if (Array.isArray(rawLabels) && rawLabels.length) {
    return rawLabels;
  }

  const contextLabels = getPermissionGroupContextLabels(activity);

  if (contextLabels.length) {
    return contextLabels;
  }

  return ['Unknown permission group'];
};

export const isPermissionGroupActivityType = (activityType?: string) =>
  !!activityType &&
  PERMISSION_GROUP_ACTIVITY_TYPES.includes(
    activityType as (typeof PERMISSION_GROUP_ACTIVITY_TYPES)[number],
  );

export const PermissionGroupAssignmentSentence = ({
  activity,
}: {
  activity: TActivityLog;
}) => {
  const activityType = activity.activityType || '';
  const [, actionType] = activityType.split('.');
  const displayLabels = getPermissionGroupDisplayLabels(activity, actionType);

  return (
    <>
      <ActivityLogActorName activity={activity} />
      <span className="text-muted-foreground">
        {PERMISSION_GROUP_ACTIVITY_LABELS[activityType] ||
          activity.action?.description ||
          'updated permission group'}
      </span>
      {displayLabels.map((label: string, index: number) => (
        <Badge key={index} variant="secondary">
          {label}
        </Badge>
      ))}
    </>
  );
};
