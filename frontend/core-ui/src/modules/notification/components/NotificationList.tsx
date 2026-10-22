import { Fragment } from 'react';
import { useAtomValue } from 'jotai';
import { IconInbox } from '@tabler/icons-react';
import { Button, ScrollArea, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { NotificationItem } from '@/notification/components/NotificationItem';
import { NotificationSelectionToolbar } from '@/notification/components/NotificationSelectionToolbar';
import { useNotificationList } from '@/notification/hooks/useNotificationList';
import { useNotificationListActions } from '@/notification/hooks/useNotificationListActions';
import { inboxDisplayOptionsState } from '@/notification/states/notificationState';

export const NotificationList = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { unreadFirst } = useAtomValue(inboxDisplayOptionsState);
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
  if (isEmpty)
    return (
      <div className="h-full flex flex-col gap-4 justify-center items-center text-muted-foreground p-6 text-center">
        <div className="border border-dashed p-6 bg-sidebar rounded-xl">
          <IconInbox />
        </div>
        <span className="text-sm">{t('no-notifications')}</span>
        <p className="text-xs">
          {t('empty-filter-hint', 'Try changing your filters.')}
        </p>
      </div>
    );
  return (
    <div className="relative flex flex-col h-full min-h-0">
      <ScrollArea.Root className="w-full h-full overflow-hidden relative bg-sidebar">
        <ScrollArea.Viewport className="[&>div]:block!">
          <div className="py-3 px-3 flex flex-col gap-2 w-full overflow-hidden">
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
                  <h3 className="px-2 pt-2 text-xs font-semibold text-muted-foreground capitalize">
                    {label}
                  </h3>
                )}
                {items.map((item) => (
                  <NotificationItem
                    key={item._id}
                    {...item}
                    selected={actions.selectedIds.includes(item._id)}
                    selectionFocused={actions.focusedId === item._id}
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
      {actions.selectedIds.length > 0 && (
        <NotificationSelectionToolbar
          selectedCount={actions.selectedIds.length}
          pending={actions.pending}
          allRead={actions.allRead}
          onMarkAsRead={actions.markSelectedAsRead}
          onDelete={actions.deleteSelected}
          onClear={actions.clear}
        />
      )}
    </div>
  );
};
