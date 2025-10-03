import { IconInbox } from '@tabler/icons-react';
import { Button, ScrollArea, Spinner } from 'erxes-ui';
import { MyInboxHeader } from './MyInboxHeader';
import { useInView } from 'react-intersection-observer';
import { NotificationItem } from '@/notification/my-inbox/components/NotificationItem';
import { useNotifications } from '@/notification/my-inbox/hooks/useNotifications';

export const Notifications = () => {
  return (
    <div className="flex flex-col h-full overflow-hidden w-full">
      <MyInboxHeader />
      <NotificationList />
    </div>
  );
};

const NotificationList = () => {
  const { notifications, loading, handleFetchMore, totalCount } =
    useNotifications();
  const { ref: inViewRef } = useInView({
    onChange: (inView) => {
      if (inView) {
        handleFetchMore();
      }
    },
  });

  if (!loading && notifications.length === 0) {
    return (
      <div className="h-full w-full flex flex-col gap-4 justify-center items-center text-accent-foreground">
        <div className="border border-dashed p-6 bg-sidebar rounded-xl">
          <IconInbox />
        </div>
        <span className="text-sm">
          No notifications to display at the moment.
        </span>
      </div>
    );
  }

  return (
    <ScrollArea.Root className="w-full h-full overflow-hidden relative bg-sidebar">
      {loading ? (
        <Spinner />
      ) : (
        <ScrollArea.Viewport className="[&>div]:!block">
          <div className="py-3 px-4 flex flex-col gap-2 w-full overflow-hidden">
            {notifications.map((notification) => (
              <NotificationItem key={notification._id} {...notification} />
            ))}
            {!loading &&
              notifications?.length > 0 &&
              totalCount > notifications.length && (
                <Button
                  variant="ghost"
                  ref={inViewRef}
                  className="h-8 w-full text-muted-foreground"
                  asChild
                >
                  <div>
                    <Spinner containerClassName="inline-flex flex-none" />
                    loading more...
                  </div>
                </Button>
              )}
          </div>
        </ScrollArea.Viewport>
      )}

      <ScrollArea.Bar orientation="vertical" />
    </ScrollArea.Root>
  );
};
