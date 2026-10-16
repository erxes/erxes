import { IconInbox } from '@tabler/icons-react';
import { Button, ScrollArea, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { NotificationItem } from '@/notification/components/NotificationItem';
import { NotificationSelectionToolbar } from '@/notification/components/NotificationSelectionToolbar';
import { useNotificationList } from '@/notification/hooks/useNotificationList';
import { useNotificationListActions } from '@/notification/hooks/useNotificationListActions';

export const NotificationList = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const { notifications, loading, inViewRef, isEmpty, hasMore } =
    useNotificationList();
  const {
    selectedIds,
    focusedId,
    clear,
    markingAsRead,
    markSelectedAsRead,
    onOpen,
  } = useNotificationListActions({ notifications, loading });

  if (isEmpty) {
    return (
      <div className="h-full w-full flex flex-col gap-4 justify-center items-center text-accent-foreground">
        <div className="border border-dashed p-6 bg-sidebar rounded-xl">
          <IconInbox />
        </div>
        <span className="text-sm">{t('no-notifications')}</span>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col h-full min-h-0">
      <ScrollArea.Root className="w-full h-full overflow-hidden relative bg-sidebar">
        {loading ? (
          <Spinner />
        ) : (
          <ScrollArea.Viewport className="[&>div]:block!">
            <div className="py-3 px-4 flex flex-col gap-2 w-full overflow-hidden">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification._id}
                  _id={notification._id}
                  createdAt={notification.createdAt}
                  message={notification.message}
                  isRead={notification.isRead}
                  contentType={notification.contentType}
                  priority={notification.priority}
                  selected={selectedIds.includes(notification._id)}
                  selectionFocused={focusedId === notification._id}
                  onOpen={(event) => onOpen(notification._id, event)}
                />
              ))}
              {!loading && hasMore && (
                <Button
                  variant="ghost"
                  ref={inViewRef}
                  className="h-8 w-full text-muted-foreground"
                  asChild
                >
                  <div>
                    <Spinner containerClassName="inline-flex flex-none" />
                    {t('loading-more')}
                  </div>
                </Button>
              )}
            </div>
          </ScrollArea.Viewport>
        )}

        <ScrollArea.Bar orientation="vertical" />
      </ScrollArea.Root>
      {selectedIds.length > 0 && (
        <NotificationSelectionToolbar
          selectedCount={selectedIds.length}
          markingAsRead={markingAsRead}
          onMarkAsRead={markSelectedAsRead}
          onClear={clear}
        />
      )}
    </div>
  );
};
