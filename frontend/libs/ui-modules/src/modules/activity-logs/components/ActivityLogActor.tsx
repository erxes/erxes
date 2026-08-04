import { IconQuestionMark } from '@tabler/icons-react';
import { Avatar, Tooltip } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { TActivityLog } from '../types';
import {
  getActivityLogActorInitial,
  getActivityLogActorName,
} from '../utils/activityLogActor';

interface ActivityLogActorProps {
  activity: TActivityLog;
}

export const ActivityLogActorName = ({ activity }: ActivityLogActorProps) => {
  const actorName = getActivityLogActorName(activity);
  const isSystem = activity.actorType === 'system' || !activity.actor;

  return (
    <span className="text-sm font-medium text-foreground">
      {isSystem ? 'System' : actorName}
    </span>
  );
};

export const ActivityLogActorAvatar = ({ activity }: ActivityLogActorProps) => {
  const isSystem = activity.actorType === 'system' || !activity.actor;
  const actorName = getActivityLogActorName(activity);

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
              {getActivityLogActorInitial(actorName)}
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
