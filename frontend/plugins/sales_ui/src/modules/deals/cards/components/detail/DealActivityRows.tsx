import { ReactNode } from 'react';
import { Badge } from 'erxes-ui';
import {
  ActivityLogCustomActivity,
  ActivityLogs,
  TActivityLog,
} from 'ui-modules';
import { DescriptionChangedActivityRow } from './overview/activity/DescriptionChangedActivityRow';

const Sentence = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-1 text-sm text-foreground">
    {children}
  </div>
);

const DealCreatedRow = ({ activity }: { activity: TActivityLog }) => (
  <Sentence>
    <ActivityLogs.ActorName activity={activity} />
    <span className="text-muted-foreground">created deal</span>
    {activity.target?.text && (
      <span className="font-medium">{activity.target.text}</span>
    )}
  </Sentence>
);

const DealMovedRow = ({ activity }: { activity: TActivityLog }) => {
  const fromStage = activity.changes?.prev?.stageId as string | undefined;
  const toStage = activity.changes?.current?.stageId as string | undefined;
  const description = activity.action?.description as string | undefined;

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">moved deal</span>
      {description ? (
        <span className="font-medium">{description}</span>
      ) : (
        <>
          {fromStage && (
            <>
              <span className="text-muted-foreground">from</span>
              <span className="font-medium">{fromStage}</span>
            </>
          )}
          {toStage && (
            <>
              <span className="text-muted-foreground">to</span>
              <span className="font-medium">{toStage}</span>
            </>
          )}
        </>
      )}
    </Sentence>
  );
};

const DealAssignmentRow = ({ activity }: { activity: TActivityLog }) => {
  const isAdded =
    !!activity.changes?.added ||
    activity.activityType.endsWith('_added') ||
    activity.activityType.endsWith('_assigned');
  const labels: string[] = isAdded
    ? activity.changes?.added?.labels || []
    : activity.changes?.removed?.labels || [];
  const verb =
    activity.action?.description || (isAdded ? 'assigned' : 'removed');

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">{verb}</span>
      {labels.length
        ? labels.map((label: string) => (
            <Badge key={label} variant="secondary" className="font-medium">
              {label}
            </Badge>
          ))
        : null}
    </Sentence>
  );
};

const DEAL_ASSIGNMENT_TYPES = [
  'assignment', // backward compat for old logged activities
  'deal.label_assigned',
  'deal.label_unassigned',
  'deal.tag_added',
  'deal.tag_removed',
  'deal.branch_assigned',
  'deal.branch_unassigned',
  'deal.department_assigned',
  'deal.department_unassigned',
];

export const dealCustomActivities: ActivityLogCustomActivity[] = [
  {
    type: 'create',
    render: (activity) => <DealCreatedRow activity={activity} />,
  },
  {
    type: 'move',
    render: (activity) => <DealMovedRow activity={activity} />,
  },
  {
    type: 'deal.stage_moved',
    render: (activity) => <DealMovedRow activity={activity} />,
  },
  ...DEAL_ASSIGNMENT_TYPES.map((type) => ({
    type,
    render: (activity: TActivityLog) => (
      <DealAssignmentRow activity={activity} />
    ),
  })),
  {
    type: 'description_change',
    render: (activity) => <DescriptionChangedActivityRow {...activity} />,
  },
];
