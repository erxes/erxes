import { ReactNode } from 'react';
import { Badge } from 'erxes-ui';
import { ActivityLogCustomActivity, ActivityLogs, TActivityLog } from 'ui-modules';

const formatPrimitive = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return 'empty';
  }

  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(', ') : 'empty';
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  return String(value);
};

const getFieldValue = (
  record: Record<string, unknown> | undefined,
  field?: string,
) => {
  if (!record || !field) {
    return undefined;
  }

  return record[field];
};

const Sentence = ({ children }: { children: ReactNode }) => (
  <div className="flex flex-wrap items-center gap-1 text-sm text-foreground">
    {children}
  </div>
);

const CustomerFieldChangedRow = ({ activity }: { activity: TActivityLog }) => {
  const field = activity.metadata?.field as string | undefined;
  const fieldLabel =
    (activity.metadata?.fieldLabel as string | undefined) || field || 'field';
  const previousValue = getFieldValue(activity.changes?.prev, field);
  const currentValue = getFieldValue(activity.changes?.current, field);
  const previousValueLabel = activity.metadata?.previousValueLabel as
    | string
    | undefined;
  const currentValueLabel = activity.metadata?.currentValueLabel as
    | string
    | undefined;

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">changed</span>
      <span className="font-medium">{fieldLabel.toLowerCase()}</span>
      <span className="text-muted-foreground">from</span>
      <span className="font-medium">
        {previousValueLabel || formatPrimitive(previousValue)}
      </span>
      <span className="text-muted-foreground">to</span>
      <span className="font-medium">
        {currentValueLabel || formatPrimitive(currentValue)}
      </span>
    </Sentence>
  );
};

const CustomerTagRow = ({
  activity,
  mode,
}: {
  activity: TActivityLog;
  mode: 'added' | 'removed';
}) => {
  const labels =
    (mode === 'added'
      ? activity.changes?.added?.labels
      : activity.changes?.removed?.labels) || [];

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">
        {mode === 'added' ? 'added tag' : 'removed tag'}
      </span>
      {labels.length ? (
        labels.map((label: string) => (
          <Badge key={label} variant="secondary" className="font-medium">
            {label}
          </Badge>
        ))
      ) : (
        <span className="font-medium">tag</span>
      )}
    </Sentence>
  );
};

export const customerCustomActivities: ActivityLogCustomActivity[] = [
  {
    type: 'customer.field_changed',
    render: (activity) => <CustomerFieldChangedRow activity={activity} />,
  },
  {
    type: 'customer.tag_added',
    render: (activity) => <CustomerTagRow activity={activity} mode="added" />,
  },
  {
    type: 'customer.tag_removed',
    render: (activity) => <CustomerTagRow activity={activity} mode="removed" />,
  },
];
