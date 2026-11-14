import type { Notification } from '@erxes/core-contract';
import { IconBell } from '@tabler/icons-react';
import { memberQueries, messageOf } from '@erxes/core-contract/client';
import { Button, Empty, Spinner, formatter, useMembersById } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { actorLabel } from '~/lib/members';
import { NotificationItem } from './NotificationItem';
import type { Inbox } from './useNotifications';

const dayLabel = (iso: string, t: (key: string, fallback: string) => string, language: string) => {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return t('today', 'Today');

  if (date.toDateString() === yesterday.toDateString()) return t('yesterday', 'Yesterday');

  return formatter(language).date(
    date,
    date.getFullYear() === today.getFullYear() ? 'MMMM d' : 'PPP',
  );
};

/** Consecutive notifications of one day, under that day's label. */
const groupByDay = (notifications: Notification[], label: (iso: string) => string) => {
  const groups: { day: string; items: Notification[] }[] = [];

  for (const notification of notifications) {
    const day = label(notification.createdAt);
    const last = groups.at(-1);

    if (last?.day === day) last.items.push(notification);
    else groups.push({ day, items: [notification] });
  }

  return groups;
};

const NotificationsEmpty = ({ unreadOnly }: { unreadOnly: boolean }) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });

  return (
    <Empty>
      <Empty.Header>
        <Empty.Media variant="icon">
          <IconBell />
        </Empty.Media>
        <Empty.Title>
          {unreadOnly ? t('all-read', 'You’re all caught up') : t('empty', 'No notifications yet')}
        </Empty.Title>
        <Empty.Description>
          {t('empty-description', 'Updates from erxes and your plugins show up here.')}
        </Empty.Description>
      </Empty.Header>
    </Empty>
  );
};

interface NotificationListProps {
  notifications: Notification[];
  loading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadingMore: boolean;
  loadMore: () => void;
  unreadOnly: boolean;
  inboxes?: Inbox[];
  onOpen?: () => void;
  compact?: boolean;
}

/** Notifications grouped by day, with their senders and inboxes; loads more on demand. */
export const NotificationList = ({
  notifications,
  loading,
  error,
  hasMore,
  loadingMore,
  loadMore,
  unreadOnly,
  inboxes = [],
  onOpen,
  compact,
}: NotificationListProps) => {
  const { t, i18n } = useTranslation('common', { keyPrefix: 'notifications' });

  const members = useMembersById(
    notifications.map((item) => (item.actorType === 'user' ? item.actorId : null)),
    memberQueries,
  );

  const inboxBySource = new Map(inboxes.map((inbox) => [inbox.source, inbox]));

  if (loading) return <Spinner area="lg" />;

  if (error) {
    return <p className="px-4 py-10 text-center text-sm text-destructive">{messageOf(error)}</p>;
  }

  if (!notifications.length) return <NotificationsEmpty unreadOnly={unreadOnly} />;

  const groups = groupByDay(notifications, (iso) => dayLabel(iso, t, i18n.language));

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
            {group.items.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                sender={actorLabel(notification.actorType, notification.actorId, members)}
                senderAvatar={
                  notification.actorType === 'user' && notification.actorId
                    ? members.get(notification.actorId)?.avatarUrl
                    : undefined
                }
                inbox={inboxBySource.get(notification.source)}
                onOpen={onOpen}
                compact={compact}
              />
            ))}
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
