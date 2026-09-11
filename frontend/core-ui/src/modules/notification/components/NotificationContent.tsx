import { CoreNotificationContent } from '@/notification/components/contents/CoreNotificationContent';
import { NoNotificationSelected } from '@/notification/components/NoNotificationSelected';
import { UnknownSystemNotificationContent } from '@/notification/components/contents/system/UnknownSystemNotificationContent';
import { useNotification } from '@/notification/hooks/useNotification';
import { ScrollArea, Spinner } from 'erxes-ui';
import {
  TNotification,
  usePermissionCheck,
  WelcomeNotificationFallback,
} from 'ui-modules';
import { NoAccessPage } from '~/pages/no-access/NoAccessPage';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';

export const NotificationContent = () => {
  const { notification, loading } = useNotification();

  if (loading) {
    return <Spinner />;
  }

  if (!notification) {
    return <NoNotificationSelected />;
  }

  return (
    <ScrollArea
      className="overflow-hidden h-full"
      viewportClassName="[&>div]:lg:min-h-dvh"
    >
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
  notification: TNotification;
}) => {
  const contentType = notification?.contentType ?? '';
  const { isLoaded, isWildcard, hasModulePermission } = usePermissionCheck();

  const normalized = contentType.replace(':', '.');
  const parts = normalized.split('.');
  const plugin = parts[0] || 'core';
  const moduleName = parts[1] || '';
  const contentName = parts[parts.length - 1] || '';

  if (plugin === 'core') {
    const CoreNotificationComponent =
      CoreNotificationContent[
        contentName as keyof typeof CoreNotificationContent
      ];

    if (!CoreNotificationComponent) {
      return (
        <UnknownSystemNotificationContent
          contentType={notification.contentType}
        />
      );
    }

    return <CoreNotificationComponent {...notification} />;
  }

  if (moduleName === 'system' && contentName === 'welcome') {
    return <WelcomeNotificationFallback pluginName={plugin} />;
  }

  if (
    isLoaded &&
    !isWildcard &&
    moduleName &&
    !hasModulePermission(moduleName)
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NoAccessPage />
      </div>
    );
  }

  return (
    <RenderPluginsComponent
      pluginName={`${plugin}_ui`}
      remoteModuleName="notificationWidget"
      props={notification}
    />
  );
};
