import { ReactNode } from 'react';
import {
  ActivityLogCustomActivity,
  ActivityLogs,
  TActivityLog,
} from 'ui-modules';

const formatPrimitive = (value: unknown): string => {
  if (value === null || value === undefined || value === '') {
    return 'empty';
  }

  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }

  if (value instanceof Date) {
    return value.toLocaleString();
  }

  if (typeof value === 'string') {
    return value;
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

const UserFieldChangedRow = ({ activity }: { activity: TActivityLog }) => {
  const field = activity.metadata?.field as string | undefined;
  const fieldLabel = activity.metadata?.fieldLabel as string | undefined;
  const previousValue = getFieldValue(activity.changes?.prev, field);
  const currentValue = getFieldValue(activity.changes?.current, field);

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">changed</span>
      <span className="font-medium">
        {(fieldLabel || 'field').toLowerCase()}
      </span>
      <span className="text-muted-foreground">from</span>
      <span className="font-medium">{formatPrimitive(previousValue)}</span>
      <span className="text-muted-foreground">to</span>
      <span className="font-medium">{formatPrimitive(currentValue)}</span>
    </Sentence>
  );
};

const UserInvitedRow = ({ activity }: { activity: TActivityLog }) => {
  const targetText = activity.target?.text;
  const invitedEmail = activity.metadata?.invitedEmail as string | undefined;

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">invited</span>
      <span className="font-medium">
        {targetText || invitedEmail || 'a member'}
      </span>
    </Sentence>
  );
};

const UserRoleChangedRow = ({ activity }: { activity: TActivityLog }) => {
  const previousRole = getFieldValue(activity.changes?.prev, 'role');
  const currentRole = getFieldValue(activity.changes?.current, 'role');

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">changed role from</span>
      <span className="font-medium">{formatPrimitive(previousRole)}</span>
      <span className="text-muted-foreground">to</span>
      <span className="font-medium">{formatPrimitive(currentRole)}</span>
    </Sentence>
  );
};

const UserStatusRow = ({
  activity,
  verb,
}: {
  activity: TActivityLog;
  verb: 'activated' | 'deactivated' | 'signed in' | 'signed out';
}) => {
  const targetText = activity.target?.text;

  return (
    <Sentence>
      <ActivityLogs.ActorName activity={activity} />
      <span className="text-muted-foreground">{verb}</span>
      {targetText ? <span className="font-medium">{targetText}</span> : null}
    </Sentence>
  );
};

export const memberCustomActivities: ActivityLogCustomActivity[] = [
  {
    type: 'user.invited',
    render: (activity) => <UserInvitedRow activity={activity} />,
  },
  {
    type: 'user.role_changed',
    render: (activity) => <UserRoleChangedRow activity={activity} />,
  },
  {
    type: 'user.activated',
    render: (activity) => (
      <UserStatusRow activity={activity} verb="activated" />
    ),
  },
  {
    type: 'user.deactivated',
    render: (activity) => (
      <UserStatusRow activity={activity} verb="deactivated" />
    ),
  },
  {
    type: 'user.logged_in',
    render: (activity) => (
      <UserStatusRow activity={activity} verb="signed in" />
    ),
  },
  {
    type: 'user.logged_out',
    render: (activity) => (
      <UserStatusRow activity={activity} verb="signed out" />
    ),
  },
];
