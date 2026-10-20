import type { DealActorBadgeProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { Avatar, readImage } from 'erxes-ui';
import { getUserDisplayName } from '~/widgets/notifications/my-inbox/utils/getUserDisplayName';

export const DealActorBadge = ({ fromUser }: DealActorBadgeProps) => {
  if (!fromUser) {
    return null;
  }

  const actorName = getUserDisplayName(fromUser);

  return (
    <span className="inline-flex items-center gap-2">
      <Avatar className="size-5">
        <Avatar.Image
          src={readImage(fromUser.details?.avatar || '')}
          alt={actorName}
        />
        <Avatar.Fallback className="text-[10px]">
          {actorName[0].toUpperCase()}
        </Avatar.Fallback>
      </Avatar>
      {actorName}
    </span>
  );
};
