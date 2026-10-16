import { NotificationsFilters } from '@/notification/components/filter/NotificationsFilters';
import { NotificationItem } from '@/notification/components/NotificationItem';
import { NotificationSort } from '@/notification/components/NotificationSort';
import { useInboxActions } from '@/notification/hooks/useInboxActions';
import { useNotifications } from '@/notification/hooks/useNotifications';
import { useUnreadNotificationCount } from '@/notification/hooks/useUnreadNotificationCount';
import { hiddenNotificationIdsState } from '@/notification/states/notificationState';
import { groupNotificationsByDay } from '@/notification/utils/groupNotificationsByDay';
import { IconChecks, IconInbox } from '@tabler/icons-react';
import {
  Button,
  cn,
  ScrollArea,
  Skeleton,
  Spinner,
  useMultiQueryState,
} from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useHotkeys } from 'react-hotkeys-hook';
import { useTranslation } from 'react-i18next';
import { useInView } from 'react-intersection-observer';
import { useNavigate, useParams } from 'react-router-dom';
import { TNotificationStatus } from 'ui-modules';

const STATUS_TABS: TNotificationStatus[] = ['unread', 'all'];

const InboxHeader = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { unreadNotificationsCount } = useUnreadNotificationCount();
  const { markAllRead, markingAllRead } = useInboxActions();
  const [{ notificationStatus }, setQueries] = useMultiQueryState<{
    notificationStatus: TNotificationStatus;
  }>(['notificationStatus']);
  const status = notificationStatus || 'unread';

  return (
    <div className="flex shrink-0 flex-col gap-2 border-b px-3 pt-3 pb-2">
      <div className="flex items-center gap-1">
        <h1 className="flex-1 px-1 text-base font-semibold">{t('inbox')}</h1>
        <NotificationsFilters />
        <NotificationSort />
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('mark-all-read')}
          title={t('mark-all-read')}
          disabled={!unreadNotificationsCount || markingAllRead}
          onClick={markAllRead}
        >
          <IconChecks />
        </Button>
      </div>
      <div className="flex gap-1" role="tablist">
        {STATUS_TABS.map((value) => (
          <Button
            key={value}
            role="tab"
            aria-selected={status === value}
            variant="ghost"
            className={cn(
              'h-7 gap-1.5 px-2.5 text-muted-foreground',
              status === value && 'bg-accent text-foreground',
            )}
            onClick={() =>
              setQueries({
                notificationStatus: value === 'unread' ? null : value,
              })
            }
          >
            {t(value)}
            {value === 'unread' && unreadNotificationsCount > 0 && (
              <span className="font-mono text-xs tabular-nums text-primary">
                {unreadNotificationsCount}
              </span>
            )}
          </Button>
        ))}
      </div>
    </div>
  );
};

const NotificationList = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const navigate = useNavigate();
  const { id } = useParams();
  const hiddenNotificationIds = useAtomValue(hiddenNotificationIdsState);
  const [{ notificationOrderBy }] = useMultiQueryState<{
    notificationOrderBy: string;
  }>(['notificationOrderBy']);
  const { notifications, loading, handleFetchMore, totalCount } =
    useNotifications();
  const { ref: inViewRef } = useInView({
    onChange: (inView) => inView && handleFetchMore(),
  });

  const visible = notifications.filter(
    (notification) => !hiddenNotificationIds.includes(notification._id),
  );
  const index = visible.findIndex((notification) => notification._id === id);
  const open = (offset: number) => {
    const next = visible[Math.max(0, index + offset)];

    if (next) navigate(`/my-inbox/${next._id}${window.location.search}`);
  };

  useHotkeys('j', () => open(index === -1 ? 0 : 1));
  useHotkeys('k', () => open(-1));

  if (loading && notifications.length === 0) {
    return (
      <div className="flex flex-col gap-2 p-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-accent text-muted-foreground">
          <IconInbox className="size-6" />
        </span>
        <div>
          <p className="text-sm font-medium">{t('all-caught-up')}</p>
          <p className="text-xs text-muted-foreground">
            {t('empty-description')}
          </p>
        </div>
      </div>
    );
  }

  // Day headings only make sense when the list is newest first.
  const groups =
    !notificationOrderBy || notificationOrderBy === 'new'
      ? groupNotificationsByDay(visible)
      : [{ day: null, items: visible }];

  return (
    <ScrollArea className="min-h-0 flex-1" viewportClassName="[&>div]:block!">
      <div className="flex flex-col gap-3 p-2">
        {groups.map(({ day, items }) => (
          <section key={day ?? 'all'} className="flex flex-col gap-0.5">
            {day && (
              <h2 className="px-3 pt-1 pb-1 font-mono text-xs font-medium text-muted-foreground uppercase">
                {t(day)}
              </h2>
            )}
            {items.map((notification) => (
              <NotificationItem key={notification._id} {...notification} />
            ))}
          </section>
        ))}
        {totalCount > notifications.length && (
          <div
            ref={inViewRef}
            className="flex h-8 items-center justify-center gap-2 text-xs text-muted-foreground"
          >
            <Spinner containerClassName="inline-flex flex-none" />
            {t('loading-more')}
          </div>
        )}
      </div>
    </ScrollArea>
  );
};

/** The inbox list pane: unread and all, grouped by day. */
export const Notifications = () => (
  <div className="flex h-full w-full flex-col overflow-hidden bg-sidebar">
    <InboxHeader />
    <NotificationList />
  </div>
);
