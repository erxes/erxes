import type { Notification } from '@erxes/core-contract';
import { IconBell, IconCheck, IconTrash } from '@tabler/icons-react';
import { Badge, Button, cn, Empty, RelativeDateDisplay, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UserAvatar } from '~/components/UserAvatar';
import { actorLabel, pluginLabel, useMembersById } from '~/lib/members';
import { useNotificationActions } from './useNotifications';

/** Core's own kinds have translated titles; plugins send theirs ready to read. */
const useNotificationTitle = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications.kinds' });

  return (notification: Notification) =>
    notification.source === 'core' ? t(notification.kind, notification.title) : notification.title;
};

const NotificationItem = ({
  notification,
  sender,
  senderAvatar,
  onOpen,
  compact,
}: {
  notification: Notification;
  sender: string;
  senderAvatar?: string | null;
  onOpen?: () => void;
  compact?: boolean;
}) => {
  const navigate = useNavigate();
  const title = useNotificationTitle();
  const { markRead, remove } = useNotificationActions();
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });

  const open = () => {
    if (!notification.read) markRead.mutate({ ids: [notification.id] });

    if (notification.link) {
      navigate(notification.link);
      onOpen?.();
    }
  };

  return (
    <li
      className={cn(
        'group relative flex gap-3 rounded-md px-3 py-2.5 hover:bg-accent',
        notification.link && 'cursor-pointer',
        !notification.read && 'bg-primary/5',
      )}
      onClick={open}
    >
      <UserAvatar name={sender} src={senderAvatar} className="mt-0.5 size-7 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className={cn('flex-1 text-sm leading-5', !notification.read && 'font-medium')}>{title(notification)}</p>
          {!notification.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-label={t('unread', 'Unread')} />}
        </div>
        {notification.body && (
          <p className={cn('text-sm text-muted-foreground', compact ? 'line-clamp-2' : 'whitespace-pre-line')}>
            {notification.body}
          </p>
        )}
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          {notification.actor.type === 'user' && (
            <>
              <span className="truncate">{sender}</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <RelativeDateDisplay value={notification.createdAt} asChild>
            <span>
              <RelativeDateDisplay.Value value={notification.createdAt} />
            </span>
          </RelativeDateDisplay>
          {notification.source !== 'core' && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
              {pluginLabel(notification.source)}
            </Badge>
          )}
          {notification.priority === 'high' && (
            <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
              {t('important', 'Important')}
            </Badge>
          )}
        </div>
      </div>
      <div className="absolute top-2 right-2 hidden gap-0.5 bg-accent group-hover:flex">
        {!notification.read && (
          <Button
            size="icon"
            variant="ghost"
            className="size-6"
            aria-label={t('mark-read', 'Mark as read')}
            onClick={(event) => {
              event.stopPropagation();
              markRead.mutate({ ids: [notification.id] });
            }}
          >
            <IconCheck className="size-3.5" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="size-6"
          aria-label={t('remove', 'Remove')}
          onClick={(event) => {
            event.stopPropagation();
            remove.mutate(notification);
          }}
        >
          <IconTrash className="size-3.5" />
        </Button>
      </div>
    </li>
  );
};

/** Notifications with their senders; loads more on demand. */
export const NotificationList = ({
  notifications,
  loading,
  hasMore,
  loadingMore,
  loadMore,
  unreadOnly,
  onOpen,
  compact,
}: {
  notifications: Notification[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
  unreadOnly: boolean;
  onOpen?: () => void;
  compact?: boolean;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  const members = useMembersById(notifications.map((item) => (item.actor.type === 'user' ? item.actor.id : null)));

  if (loading) {
    return <Spinner containerClassName="py-10" />;
  }

  if (!notifications.length) {
    return (
      <Empty className="py-10">
        <Empty.Header>
          <Empty.Media variant="icon">
            <IconBell />
          </Empty.Media>
          <Empty.Title>{unreadOnly ? t('all-read', 'You’re all caught up') : t('empty', 'No notifications yet')}</Empty.Title>
          <Empty.Description>
            {t('empty-description', 'Updates from erxes and your plugins show up here.')}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  return (
    <ul className="flex flex-col gap-0.5 p-1">
      {notifications.map((notification) => {
        const member = notification.actor.type === 'user' && notification.actor.id ? members.get(notification.actor.id) : undefined;

        return (
          <NotificationItem
            key={notification.id}
            notification={notification}
            sender={actorLabel(notification.actor, members)}
            senderAvatar={member?.avatarUrl}
            onOpen={onOpen}
            compact={compact}
          />
        );
      })}
      {hasMore && (
        <li className="flex justify-center py-1">
          <Button variant="ghost" size="sm" disabled={loadingMore} onClick={loadMore}>
            {loadingMore ? <Spinner size="sm" /> : t('load-more', 'Load more')}
          </Button>
        </li>
      )}
    </ul>
  );
};
