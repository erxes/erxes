import type { TeamActorProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { Avatar, readImage } from 'erxes-ui';
import { getUserDisplayName } from '~/widgets/notifications/my-inbox/utils/getUserDisplayName';

export const TeamActor = ({ user }: TeamActorProps) => {
  if (!user) {
    return null;
  }

  const displayName = getUserDisplayName(user);

  return (
    <span className="inline-flex items-center gap-1.5">
      <Avatar className="size-5">
        <Avatar.Fallback className="text-[10px]">
          {displayName.charAt(0).toUpperCase()}
        </Avatar.Fallback>
        <Avatar.Image
          alt={displayName}
          src={readImage(user.details?.avatar || '')}
        />
      </Avatar>
      <span>{displayName}</span>
    </span>
  );
};
