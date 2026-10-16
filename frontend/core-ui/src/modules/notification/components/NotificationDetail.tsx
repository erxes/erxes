import { NoNotificationSelected } from '@/notification/components/NoNotificationSelected';
import { NotificationContentWrapper } from '@/notification/components/NotificationContentWrapper';
import { useNotificationContext } from '@/notification/context/NotificationContext';
import { ScrollArea, Spinner } from 'erxes-ui';

export const NotificationDetail = () => {
  const { notification, loading, error } = useNotificationContext();

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      {loading ? (
        <Spinner />
      ) : error ? (
        <div
          role="alert"
          className="flex h-full items-center justify-center p-6 text-sm text-destructive"
        >
          {error.message}
        </div>
      ) : !notification ? (
        <NoNotificationSelected />
      ) : (
        <ScrollArea className="h-full overflow-hidden">
          <NotificationContentWrapper key={notification._id} />
        </ScrollArea>
      )}
    </div>
  );
};
