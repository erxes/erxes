import { CoreNotificationContent } from '@/notification/components/contents/CoreNotificationContent';
import { NoNotificationSelected } from '@/notification/components/NoNotificationSelected';
import { useNotification } from '@/notification/hooks/useNotification';
import { ScrollArea, Spinner } from 'erxes-ui';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { INotification } from '@/notification/types/notifications';

export const NotificationContent = () => {
  const { notification, loading } = useNotification();

  if (loading) {
    return <Spinner />;
  }

  if (!notification) {
    return <NoNotificationSelected />;
  }

  return (
    <ScrollArea className="overflow-hidden h-full" viewportClassName='[&>div]:lg:min-h-dvh'>
      <NotificationContentWrapper
        key={notification._id}
        notification={notification}
      />
    </ScrollArea>
  );
};

const NotificationContentWrapper = ({ notification }: { notification: INotification }) => {
  const contentType = notification?.contentType ?? '';

  const normalized = contentType.replace(':', '.');
  const parts = normalized.split('.');
  const plugin = parts[0] || 'core';

  if (plugin === 'core') {
    const key = parts[parts.length - 1] || '';

    const CoreNotificationComponent =
      CoreNotificationContent[key as keyof typeof CoreNotificationContent] ??
      (() => <></>);

    return <CoreNotificationComponent {...notification} />;
  }
  return (
    <RenderPluginsComponent
      pluginName={`${plugin}_ui`}
      remoteModuleName="notificationWidget"
      props={notification}
    />
  );
};

