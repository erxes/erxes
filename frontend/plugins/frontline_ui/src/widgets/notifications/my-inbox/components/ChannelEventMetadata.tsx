import type { ChannelEventMetadataProps } from '~/widgets/notifications/my-inbox/types/notificationContent';
import { Avatar, RelativeDateDisplay, readImage } from 'erxes-ui';
import { getUserDisplayName } from '~/widgets/notifications/my-inbox/utils/getUserDisplayName';

export const ChannelEventMetadata = ({
  action,
  createdAt,
  fromUser,
}: ChannelEventMetadataProps) => {
  const actorName = getUserDisplayName(fromUser);

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      {fromUser ? (
        <span className="flex items-center gap-1.5">
          <Avatar className="size-5">
            <Avatar.Image
              src={readImage(fromUser.details?.avatar || '')}
              alt={actorName}
            />
            <Avatar.Fallback className="text-[10px]">
              {actorName.slice(0, 1).toUpperCase()}
            </Avatar.Fallback>
          </Avatar>
          {actorName}
        </span>
      ) : null}
      {action ? <span>{action}</span> : null}
      {createdAt ? <RelativeDateDisplay.Value value={createdAt} /> : null}
    </div>
  );
};
