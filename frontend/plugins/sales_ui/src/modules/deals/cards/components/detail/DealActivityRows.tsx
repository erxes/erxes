import { ReactNode } from 'react';
import { Badge } from 'erxes-ui';
import {
  ActivityLogCustomActivity,
  ActivityLogs,
  MembersInline,
  TActivityLog,
} from 'ui-modules';
import { DescriptionChangedActivityRow } from './overview/activity/DescriptionChangedActivityRow';
import { useTranslation } from 'react-i18next';

const Sentence = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-1 text-sm text-foreground">
    {children}
  </div>
);

const DealCreatedRow = ({ activity }: { activity: TActivityLog }) => {
  const { t } = useTranslation('sales');
  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">{t('created-deal')}</span>
      {activity.target?.text && (
        <span className="font-medium">{activity.target.text}</span>
      )}
    </Sentence>
  );
};

const DealMovedRow = ({ activity }: { activity: TActivityLog }) => {
  const { t } = useTranslation('sales');
  const fromStage = activity.changes?.prev?.stageId as string | undefined;
  const toStage = activity.changes?.current?.stageId as string | undefined;
  const description = activity.action?.description as string | undefined;

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">{t('move-deal')}</span>
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
        ? labels.map((label: string, index: number) => (
            <Badge key={index} variant="secondary" className="font-medium">
              {label}
            </Badge>
          ))
        : null}
    </Sentence>
  );
};

const DealAssigneeRow = ({ activity }: { activity: TActivityLog }) => {
  const { t } = useTranslation('sales');
  const isAdded = activity.action?.type === 'assigned';
  const memberIds =
    (isAdded ? activity.changes?.added : activity.changes?.removed) || [];

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">
        {isAdded ? t('assigned') : t('unassigned')}
      </span>
      <MembersInline
        memberIds={Array.isArray(memberIds) ? memberIds : []}
        placeholder={t('unknown-member')}
      />
    </Sentence>
  );
};

const DealWatchRow = ({ activity }: { activity: TActivityLog }) => {
  const isWatching =
    activity.activityType === 'deal.watch_added' ||
    activity.action?.type === 'watch';

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">
        {isWatching ? 'started watching deal' : 'stopped watching deal'}
      </span>
    </Sentence>
  );
};

const ChecklistActivityRow = ({ activity }: { activity: TActivityLog }) => {
  const { t } = useTranslation('sales');
  const checklistName = activity.metadata?.checklistTitle as string | undefined;
  const itemName = activity.metadata?.checklistItemTitle as string | undefined;

  if (activity.activityType === 'checklist.create') {
    return (
      <Sentence>
        <ActivityLogs.ActorName activity={activity} />
        <span className="text-muted-foreground">{t('created-checklist')}</span>
        {checklistName && (
          <Badge variant="secondary" className="font-medium">
            {checklistName}
          </Badge>
        )}
      </Sentence>
    );
  }

  if (activity.activityType === 'checklist.remove') {
    return (
      <Sentence>
        <ActivityLogs.ActorName activity={activity} />
        <span className="text-muted-foreground">{t('removed-checklist')}</span>
        {checklistName && (
          <Badge variant="secondary" className="font-medium">
            {checklistName}
          </Badge>
        )}
      </Sentence>
    );
  }

  if (activity.activityType === 'checklist.item_create') {
    return (
      <Sentence>
        <ActivityLogs.ActorName activity={activity} />
        <span className="text-muted-foreground">{t('added-checklist-item')}</span>
        {itemName && (
          <Badge variant="secondary" className="font-medium">
            {itemName}
          </Badge>
        )}
        <span className="text-muted-foreground">to</span>
        {checklistName && (
          <Badge variant="secondary" className="font-medium">
            {checklistName}
          </Badge>
        )}
      </Sentence>
    );
  }

  if (activity.activityType === 'checklist.item_remove') {
    return (
      <Sentence>
        <ActivityLogs.ActorName activity={activity} />
        <span className="text-muted-foreground">{t('removed-checklist-item')}</span>
        {itemName && (
          <Badge variant="secondary" className="font-medium">
            {itemName}
          </Badge>
        )}
        <span className="text-muted-foreground">from</span>
        {checklistName && (
          <Badge variant="secondary" className="font-medium">
            {checklistName}
          </Badge>
        )}
      </Sentence>
    );
  }

  if (activity.activityType === 'checklist.item_checked') {
    return (
      <Sentence>
        <ActivityLogs.ActorName activity={activity} />
        <span className="text-muted-foreground">
          {t('checked-off-checklist-item')}
        </span>
        {itemName && (
          <Badge variant="secondary" className="font-medium">
            {itemName}
          </Badge>
        )}
        <span className="text-muted-foreground">in</span>
        {checklistName && (
          <Badge variant="secondary" className="font-medium">
            {checklistName}
          </Badge>
        )}
      </Sentence>
    );
  }

  if (activity.activityType === 'checklist.item_unchecked') {
    return (
      <Sentence>
        <ActivityLogs.ActorName activity={activity} />
        <span className="text-muted-foreground">{t('unchecked-checklist-item')}</span>
        {itemName && (
          <Badge variant="secondary" className="font-medium">
            {itemName}
          </Badge>
        )}
        <span className="text-muted-foreground">in</span>
        {checklistName && (
          <Badge variant="secondary" className="font-medium">
            {checklistName}
          </Badge>
        )}
      </Sentence>
    );
  }

  return null;
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
  {
    type: 'assignee',
    render: (activity) => <DealAssigneeRow activity={activity} />,
  },
  {
    type: 'deal.watch_added',
    render: (activity) => <DealWatchRow activity={activity} />,
  },
  {
    type: 'deal.watch_removed',
    render: (activity) => <DealWatchRow activity={activity} />,
  },
  ...[
    'checklist.create',
    'checklist.remove',
    'checklist.item_create',
    'checklist.item_remove',
    'checklist.item_checked',
    'checklist.item_unchecked',
  ].map((type) => ({
    type,
    render: (activity: TActivityLog) => (
      <ChecklistActivityRow activity={activity} />
    ),
  })),
  ...DEAL_ASSIGNMENT_TYPES.map((type) => ({
    type,
    render: (activity: TActivityLog) => (
      <DealAssignmentRow activity={activity} />
    ),
  })),
  {
    type: 'description_change',
    render: (activity) => <DescriptionChangedActivityRow activity={activity} />,
  },
];
