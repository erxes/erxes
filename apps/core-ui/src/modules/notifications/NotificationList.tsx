import type { ContentType, Notification } from '@erxes/core-contract';
import {
  IconBell,
  IconCheck,
  IconChevronDown,
  IconExternalLink,
  IconTrash,
} from '@tabler/icons-react';
import { Badge, Button, cn, Empty, RelativeDateDisplay, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ChangeList, useChangeLookups } from '~/components/ChangeList';
import { UserAvatar } from '~/components/UserAvatar';
import { actorLabel, useMembersById } from '~/lib/members';
import { type Inbox, useNotificationActions } from './useNotifications';

type Changes = Record<string, [unknown, unknown]>;

/** Core's own kinds have translated titles; plugins send theirs ready to read. */
const useNotificationTitle = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications.kinds' });

  return (notification: Notification) =>
    notification.source === 'core' ? t(notification.kind, notification.title) : notification.title;
};

const changesOf = (notification: Notification) => {
  const changes = notification.data.changes as Changes | undefined;

  return changes && Object.keys(changes).length ? changes : null;
};

/** What changed, with names for owners, tags and properties of the record. */
const NotificationChanges = ({
  notification,
  changes,
}: {
  notification: Notification;
  changes: Changes;
}) => {
  const contentType: ContentType = notification.entity?.type === 'company' ? 'company' : 'customer';
  const lookups = useChangeLookups(contentType, [changes]);

  return <ChangeList changes={changes} lookups={lookups} />;
};

const dayLabel = (iso: string, t: (key: string, fallback: string) => string, language: string) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return t('today', 'Today');

  if (date.toDateString() === yesterday.toDateString()) return t('yesterday', 'Yesterday');

  return date.toLocaleDateString(language, {
    month: 'long',
    day: 'numeric',
    year: date.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
};

const NotificationItem = ({
  notification,
  sender,
  senderAvatar,
  inbox,
  onOpen,
  compact,
}: {
  notification: Notification;
  sender: string;
  senderAvatar?: string | null;
  inbox?: Inbox;
  onOpen?: () => void;
  compact?: boolean;
}) => {
  const navigate = useNavigate();
  const title = useNotificationTitle();
  const { markRead, remove } = useNotificationActions();
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  const [expanded, setExpanded] = useState(false);
  const changes = changesOf(notification);
  const InboxIcon = inbox?.icon;

  const open = () => {
    if (!notification.read) markRead.mutate({ ids: [notification.id] });

    if (notification.link) {
      navigate(notification.link);
      onOpen?.();
    } else if (changes && !compact) {
      setExpanded((value) => !value);
    }
  };

  return (
    <li
      className={cn(
        'group relative flex gap-3 rounded-md px-3 py-2.5 hover:bg-accent',
        (notification.link || changes) && 'cursor-pointer',
        !notification.read && 'bg-primary/5',
      )}
      onClick={open}
    >
      <span className="relative mt-0.5 shrink-0">
        <UserAvatar name={sender} src={senderAvatar} className="size-7" />
        {InboxIcon && (
          <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full border bg-background text-primary [&>svg]:size-2.5">
            <InboxIcon className="size-2.5" />
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className={cn('flex-1 text-sm leading-5', !notification.read && 'font-medium')}>
            {title(notification)}
          </p>
          {!notification.read && (
            <span
              className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
              aria-label={t('unread', 'Unread')}
            />
          )}
        </div>
        {notification.body && (
          <p
            className={cn(
              'text-sm text-muted-foreground',
              compact ? 'line-clamp-2' : 'whitespace-pre-line',
            )}
          >
            {notification.body}
          </p>
        )}
        {changes && !compact && expanded && (
          <NotificationChanges notification={notification} changes={changes} />
        )}
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
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
          {inbox && notification.source !== 'core' && (
            <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
              {inbox.label}
            </Badge>
          )}
          {notification.priority === 'high' && (
            <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
              {t('important', 'Important')}
            </Badge>
          )}
          {changes && !compact && (
            <button
              type="button"
              className="inline-flex items-center gap-0.5 text-primary hover:underline"
              onClick={(event) => {
                event.stopPropagation();
                setExpanded((value) => !value);
              }}
            >
              {t('changes', {
                count: Object.keys(changes).length,
                defaultValue: `${Object.keys(changes).length} changes`,
              })}
              <IconChevronDown
                className={cn('size-3 transition-transform', expanded && 'rotate-180')}
              />
            </button>
          )}
        </div>
      </div>
      <div className="absolute top-2 right-2 hidden gap-0.5 rounded-md bg-accent group-hover:flex">
        {notification.link && !compact && (
          <Button
            size="icon"
            variant="ghost"
            className="size-6"
            aria-label={t('open', 'Open')}
            onClick={open}
          >
            <IconExternalLink className="size-3.5" />
          </Button>
        )}
        <Button
          size="icon"
          variant="ghost"
          className="size-6"
          aria-label={
            notification.read ? t('mark-unread', 'Mark as unread') : t('mark-read', 'Mark as read')
          }
          onClick={(event) => {
            event.stopPropagation();
            markRead.mutate({ ids: [notification.id], read: !notification.read });
          }}
        >
          <IconCheck className={cn('size-3.5', notification.read && 'text-primary')} />
        </Button>
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

/** Notifications grouped by day, with their senders and inboxes; loads more on demand. */
export const NotificationList = ({
  notifications,
  loading,
  hasMore,
  loadingMore,
  loadMore,
  unreadOnly,
  inboxes = [],
  onOpen,
  compact,
}: {
  notifications: Notification[];
  loading: boolean;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
  unreadOnly: boolean;
  inboxes?: Inbox[];
  onOpen?: () => void;
  compact?: boolean;
}) => {
  const { t, i18n } = useTranslation('common', { keyPrefix: 'notifications' });

  const members = useMembersById(
    notifications.map((item) => (item.actor.type === 'user' ? item.actor.id : null)),
  );

  const inboxBySource = new Map(inboxes.map((inbox) => [inbox.source, inbox]));

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
          <Empty.Title>
            {unreadOnly
              ? t('all-read', 'You’re all caught up')
              : t('empty', 'No notifications yet')}
          </Empty.Title>
          <Empty.Description>
            {t('empty-description', 'Updates from erxes and your plugins show up here.')}
          </Empty.Description>
        </Empty.Header>
      </Empty>
    );
  }

  const groups: { day: string; items: Notification[] }[] = [];

  for (const notification of notifications) {
    const day = dayLabel(notification.createdAt, t, i18n.language);
    const last = groups[groups.length - 1];

    if (last?.day === day) last.items.push(notification);
    else groups.push({ day, items: [notification] });
  }

  return (
    <div className="p-1">
      {groups.map((group) => (
        <section key={group.day}>
          {!compact && (
            <h3 className="sticky top-0 z-10 bg-background/95 px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase backdrop-blur">
              {group.day}
            </h3>
          )}
          <ul className="flex flex-col gap-0.5">
            {group.items.map((notification) => {
              const member =
                notification.actor.type === 'user' && notification.actor.id
                  ? members.get(notification.actor.id)
                  : undefined;

              return (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  sender={actorLabel(notification.actor, members)}
                  senderAvatar={member?.avatarUrl}
                  inbox={inboxBySource.get(notification.source)}
                  onOpen={onOpen}
                  compact={compact}
                />
              );
            })}
          </ul>
        </section>
      ))}
      {hasMore && (
        <div className="flex justify-center py-1">
          <Button variant="ghost" size="sm" disabled={loadingMore} onClick={loadMore}>
            {loadingMore ? <Spinner size="sm" /> : t('load-more', 'Load more')}
          </Button>
        </div>
      )}
    </div>
  );
};
