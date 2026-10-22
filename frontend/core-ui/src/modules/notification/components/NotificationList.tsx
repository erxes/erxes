import { Fragment } from 'react';
import { useAtomValue } from 'jotai';
import {
  Button,
  ScrollArea,
  Spinner,
  useNonNullMultiQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { NOTIFICATION_FILTER_QUERY_KEYS } from '@/notification/constants/notifications';
import type { NotificationFilterQueryState } from '@/notification/types/notificationFilters';
import { NotificationItem } from '@/notification/components/NotificationItem';
import { NotificationSelectionToolbar } from '@/notification/components/NotificationSelectionToolbar';
import { NotificationEmptyState } from '@/notification/components/NotificationEmptyState';
import { NotificationShortcuts } from '@/notification/components/NotificationShortcuts';
import { useNotificationList } from '@/notification/hooks/useNotificationList';
import { useNotificationListActions } from '@/notification/hooks/useNotificationListActions';
import { inboxDisplayOptionsState } from '@/notification/states/notificationState';

export const NotificationList = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const filters = useNonNullMultiQueryState<NotificationFilterQueryState>(
    NOTIFICATION_FILTER_QUERY_KEYS,
  );
  const { grouping, unreadFirst } = useAtomValue(inboxDisplayOptionsState);
  const {
    notifications,
    groups,
    loading,
    inViewRef,
    isEmpty,
    hasMore,
    error,
    retry,
    fetchingMore,
    fetchMoreError,
    loadMore,
  } = useNotificationList();
  const actions = useNotificationListActions({ notifications, loading });
  if (loading) return <Spinner />;
  if (error && !notifications.length)
    return (
      <div
        role="alert"
        className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center"
      >
        <p className="text-sm text-destructive">
          {t('list-load-failed', 'Unable to load notifications')}
        </p>
        <Button variant="secondary" onClick={() => void retry()}>
          {t('retry', 'Retry')}
        </Button>
      </div>
    );
  if (isEmpty) return <NotificationEmptyState />;
  return (
    <div className="relative flex flex-col h-full min-h-0">
      <ScrollArea.Root
        key={JSON.stringify([filters, grouping, unreadFirst])}
        className="relative h-full w-full overflow-hidden bg-sidebar"
      >
        <ScrollArea.Viewport className="[&>div]:block!">
          <div className="flex w-full min-w-0 flex-col gap-2 px-3 py-3">
            {error && (
              <div role="alert" className="text-xs text-destructive">
                {t('refresh-failed', 'Unable to refresh notifications')}{' '}
                <Button variant="ghost" size="sm" onClick={() => void retry()}>
                  {t('retry', 'Retry')}
                </Button>
              </div>
            )}
            {groups.map(([label, items]) => (
              <Fragment key={`${label}:${unreadFirst && items[0].isRead}`}>
                {label && (
                  <h3 className="flex items-center justify-between px-2 pt-2 text-xs font-semibold text-muted-foreground capitalize">
                    <span>{label}</span>
                    <span
                      className="tabular-nums"
                      title={t('notification-count', { count: items.length })}
                    >
                      {items.length}
                    </span>
                  </h3>
                )}
                {items.map((item) => (
                  <NotificationItem
                    key={item._id}
                    {...item}
                    selected={actions.selectedIds.includes(item._id)}
                    selectionDisabled={actions.pending}
                    selectionFocused={actions.focusedId === item._id}
                    onToggleSelection={(shiftKey) =>
                      actions.select(item._id, shiftKey)
                    }
                    onOpen={(event) => actions.onOpen(item._id, event)}
                  />
                ))}
              </Fragment>
            ))}
            {fetchMoreError ? (
              <div
                role="alert"
                className="p-2 text-center text-xs text-destructive"
              >
                {t('load-more-failed', 'Unable to load more notifications')}
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => void loadMore()}
                >
                  {t('retry', 'Retry')}
                </Button>
              </div>
            ) : (
              hasMore && (
                <Button
                  variant="ghost"
                  ref={inViewRef}
                  className="h-8 w-full text-muted-foreground"
                  disabled={fetchingMore}
                  onClick={() => void loadMore()}
                >
                  {fetchingMore && (
                    <Spinner containerClassName="inline-flex flex-none" />
                  )}
                  {fetchingMore
                    ? t('loading-more')
                    : t('load-more', 'Load more')}
                </Button>
              )
            )}
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Bar orientation="vertical" />
      </ScrollArea.Root>
      {actions.selectedIds.length > 0 ? (
        <NotificationSelectionToolbar
          selectedCount={actions.selectedIds.length}
          visibleCount={notifications.length}
          pending={actions.pending}
          allRead={actions.allRead}
          onToggleAll={actions.toggleAll}
          onMarkAsRead={actions.markSelectedAsRead}
          onDelete={actions.deleteSelected}
          onClear={actions.clear}
        />
      ) : (
        <div className="flex h-10 shrink-0 items-center justify-between border-t px-4 text-[11px] text-muted-foreground">
          <span>
            {t('conversation-count', {
              count: notifications.length,
              defaultValue_one: '{{count}} conversation',
              defaultValue_other: '{{count}} conversations',
            })}
          </span>
          <NotificationShortcuts />
        </div>
      )}
    </div>
  );
};
