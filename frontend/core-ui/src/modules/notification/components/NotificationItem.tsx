import { OrgLogoIcon } from '@/auth/components/Logo';
import { timeAgo } from '@/home/utils/timeAgo';
import { AppLogo } from '@/navigation/components/AppLogo';
import { useInboxActions } from '@/notification/hooks/useInboxActions';
import { useNotificationApp } from '@/notification/hooks/useNotificationApp';
import { IconArchive } from '@tabler/icons-react';
import { Avatar, Button, cn, readImage } from 'erxes-ui';
import { Link, useParams } from 'react-router-dom';
import { TNotification } from 'ui-modules';

const PRIORITY_STYLES: Partial<Record<TNotification['priority'], string>> = {
  urgent: 'text-destructive',
  high: 'text-warning',
};

export const NotificationMark = ({
  contentType,
  size = 32,
}: {
  contentType?: string;
  size?: number;
}) => {
  const { app } = useNotificationApp(contentType);

  if (app) return <AppLogo activity={app} size={size} />;

  return (
    <span
      className="grid shrink-0 place-items-center rounded-[23%] border bg-background [&>img]:size-1/2! [&>svg]:size-1/2!"
      style={{ width: size, height: size }}
    >
      <OrgLogoIcon className="text-primary" />
    </span>
  );
};

export const NotificationItem = ({
  _id,
  createdAt = '',
  title,
  message,
  isRead,
  contentType = '',
  priority,
  fromUser,
}: TNotification) => {
  const { id } = useParams();
  const isActive = id === _id;
  const { label: appLabel } = useNotificationApp(contentType);
  const { archiveNotification, archiving } = useInboxActions();
  const sender = fromUser?.details?.fullName;

  return (
    <div
      className={cn(
        'group/item relative flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/60',
        isActive && 'bg-accent hover:bg-accent',
      )}
    >
      {isActive && (
        <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-primary" />
      )}
      <span className="relative mt-0.5 shrink-0">
        <NotificationMark contentType={contentType} />
        {fromUser && (
          <Avatar className="absolute -right-1.5 -bottom-1.5 size-[18px] ring-2 ring-sidebar">
            <Avatar.Image
              src={readImage(fromUser.details?.avatar || '')}
              alt={sender}
            />
            <Avatar.Fallback className="text-[9px]">
              {sender?.charAt(0)}
            </Avatar.Fallback>
          </Avatar>
        )}
      </span>
      <Link
        to={`/my-inbox/${_id}${window.location.search}`}
        className="min-w-0 flex-1 after:absolute after:inset-0"
      >
        <span className="flex items-baseline gap-2">
          <span
            className={cn(
              'min-w-0 flex-1 truncate text-sm',
              isRead ? 'text-muted-foreground' : 'font-semibold',
            )}
          >
            {title || message}
          </span>
          <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums group-hover/item:invisible">
            {timeAgo(createdAt)}
          </span>
        </span>
        {title && message && (
          <span className="block truncate text-xs text-muted-foreground">
            {message}
          </span>
        )}
        <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="truncate">
            {[appLabel, sender].filter(Boolean).join(' · ')}
          </span>
          {PRIORITY_STYLES[priority] && (
            <span
              className={cn(
                'shrink-0 font-medium capitalize',
                PRIORITY_STYLES[priority],
              )}
            >
              · {priority}
            </span>
          )}
        </span>
      </Link>
      {!isRead && (
        <span
          className="mt-2 size-2 shrink-0 rounded-full bg-primary group-hover/item:invisible"
          aria-label="Unread"
        />
      )}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1.5 right-1.5 z-10 size-7 text-muted-foreground opacity-0 group-hover/item:opacity-100 focus-visible:opacity-100"
        aria-label="Archive"
        title="Archive"
        disabled={archiving}
        onClick={() => archiveNotification(_id)}
      >
        <IconArchive />
      </Button>
    </div>
  );
};
