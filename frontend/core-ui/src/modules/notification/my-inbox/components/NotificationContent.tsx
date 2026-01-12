import { CoreNotificationContent } from '@/notification/my-inbox/components/contents/CoreNotificationContent';
import { NoNotificationSelected } from '@/notification/my-inbox/components/NoNotificationSelected';
import { useNotification } from '@/notification/my-inbox/hooks/useNotification';
import { ScrollArea, Spinner } from 'erxes-ui';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { INotification } from '@/notification/my-inbox/types/notifications';

export const NotificationContent = () => {
  const { notification, loading } = useNotification();

  if (loading) {
    return <Spinner />;
  }

  if (!notification) {
    return <NoNotificationSelected />;
  }

  return (
    <ScrollArea className="overflow-hidden h-full">
      <NotificationContentWrapper
        key={notification._id}
        notification={notification}
      />
    </ScrollArea>
  );
};

const NotificationContentWrapper = ({
  notification,
}: {
  notification: INotification;
}) => {
  const [pluginName, moduleName, collectionType] = (
    notification?.contentType || ''
  )
    .replace(':', '.')
    .split('.');

  if (pluginName === 'core') {
    const CoreNotificationComponent =
      CoreNotificationContent[
        collectionType as keyof typeof CoreNotificationContent
      ] ?? (() => <></>);
    return <CoreNotificationComponent {...notification} />;
  }

  return (
    <RenderPluginsComponent
      pluginName={`${pluginName}_ui`}
      remoteModuleName="notificationWidget"
      moduleName={moduleName}
      props={notification}
    />
  );
};
