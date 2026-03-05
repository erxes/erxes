import React from 'react';
import { IconQuestionMark } from '@tabler/icons-react';
import { Avatar, RelativeDateDisplay, Tooltip } from 'erxes-ui';
import { TActivityLog } from '../types';
import { useActivityLog } from '../context/ActivityLogProvider';
import { Link } from 'react-router-dom';

interface ActivityLogRowProps {
  activity: TActivityLog;
  isLast?: boolean;
}

export const ActivityLogActorName = ({ activity }: ActivityLogRowProps) => {
  const actorName = getActorName(activity);

  const isSystem = activity.actorType === 'system' || !activity.actor;

  return (
    <p className="text-sm font-medium text-foreground">
      {isSystem ? 'System' : actorName}
    </p>
  );
};

const ActivityLogActorAvatar = ({ activity }: ActivityLogRowProps) => {
  const isSystem = activity.actorType === 'system' || !activity.actor;
  const actorName = getActorName(activity);

  if (isSystem) {
    return (
      <div className="size-6 rounded-full bg-muted flex items-center justify-center border border-background">
        <IconQuestionMark className="size-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <Tooltip>
      <Tooltip.Trigger asChild>
        <Link to={`/settings/team-member?user_id=${activity.actor?._id}`}>
          <Avatar size="lg">
            {activity.actor?.details?.avatar ? (
              <Avatar.Image
                src={activity.actor.details.avatar}
                alt={actorName}
              />
            ) : null}
            <Avatar.Fallback className="text-xs">
              {getActorInitial(actorName)}
            </Avatar.Fallback>
          </Avatar>
        </Link>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <p>{actorName}</p>
      </Tooltip.Content>
    </Tooltip>
  );
};

export function ActivityLogRow({
  activity,
  isLast = false,
}: ActivityLogRowProps) {
  const { customActivities } = useActivityLog();
  const customRenderer = customActivities?.find(
    ({ type }) => type === activity.activityType,
  );

  const defaultBody = (
    <div className="flex flex-col gap-1">
      <p className="text-sm text-foreground flex flex-row gap-1">
        <ActivityLogActorName activity={activity} />
        <span className="text-muted-foreground">
          {activity.action?.description || activity.action?.action}
        </span>
        {activity.context?.text || activity.contextType ? (
          <span className="text-muted-foreground">
            {' '}
            {activity.context?.text || activity.contextType}
          </span>
        ) : null}
      </p>
    </div>
  );

  return (
    <div className="relative flex flex-row gap-2 pb-6">
      {/* Timeline vertical line */}
      {!isLast && (
        <div className="absolute left-3 -translate-x-1/2 top-6 bottom-0 w-px bg-border" />
      )}

      {/* Avatar/Icon container */}
      <div className="relative z-10 shrink-0">
        <ActivityLogActorAvatar activity={activity} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5 items-center flex">
        {customRenderer ? customRenderer.render(activity) : defaultBody}
      </div>
      <div className="absolute right-0 top-0.5">
        <RelativeDateDisplay value={activity.createdAt as string} asChild>
          <p className="text-xs text-muted-foreground leading-6">
            <RelativeDateDisplay.Value value={activity.createdAt as string} />
          </p>
        </RelativeDateDisplay>
      </div>
    </div>
  );
}

function getActorName(activity: TActivityLog): string {
  const actor = activity.actor;

  if (!actor) {
    return 'Unknown user';
  }

  return (
    actor.details?.fullName || actor.username || actor.email || 'Unknown user'
  );
}

function getActorInitial(name: string) {
  return name?.[0]?.toUpperCase() || '?';
}
