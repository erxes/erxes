import { Badge } from 'erxes-ui';
import { TActivityLog } from '../types';
import { ActivityLogActorName } from './ActivityLogActor';

const ASSIGNMENT_ACTIVITY_TYPES = [
  'tag.added',
  'tag.removed',
  'structure_entity.assigned',
  'structure_entity.unassigned',
  'structure_seat.assigned',
  'structure_seat.unassigned',
] as const;

const ASSIGNMENT_ACTIVITY_LABELS: Record<string, string> = {
  'tag.added': 'added tag',
  'tag.removed': 'removed tag',
  'structure_entity.assigned': 'added to',
  'structure_entity.unassigned': 'removed from',
  'structure_seat.assigned': 'got seat',
  'structure_seat.unassigned': 'lost seat',
};

export const isAssignmentActivityType = (activityType?: string) =>
  !!activityType &&
  ASSIGNMENT_ACTIVITY_TYPES.includes(
    activityType as (typeof ASSIGNMENT_ACTIVITY_TYPES)[number],
  );

export const AssignmentSentence = ({
  activity,
}: {
  activity: TActivityLog;
}) => {
  const activityType = activity.activityType || '';
  const [, actionType] = activityType.split('.');
  const labels =
    (actionType === 'added' || actionType === 'assigned'
      ? activity.changes?.added?.labels
      : activity.changes?.removed?.labels) || [];

  return (
    <>
      <ActivityLogActorName activity={activity} />
      <span className="text-muted-foreground">
        {ASSIGNMENT_ACTIVITY_LABELS[activityType] ||
          activity.action?.description ||
          'updated'}
      </span>
      {labels.map((label: string, index: number) => (
        <Badge
          key={index}
          variant="secondary"
          className="h-7 rounded-lg border border-border/60 bg-background/80 px-2.5 font-normal text-foreground shadow-none"
        >
          {label}
        </Badge>
      ))}
    </>
  );
};
