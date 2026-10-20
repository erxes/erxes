import { CoreNotificationContent } from '@/notification/components/contents/CoreNotificationContent';
import { UnknownSystemNotificationContent } from '@/notification/components/contents/system/UnknownSystemNotificationContent';
import { useNotificationContext } from '@/notification/context/NotificationContext';
import { usePermissionCheck, WelcomeNotificationFallback } from 'ui-modules';
import { NoAccessPage } from '~/pages/no-access/NoAccessPage';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';

export const NotificationContentWrapper = () => {
  const { notification } = useNotificationContext();
  const contentType = notification?.contentType ?? '';
  const { isLoaded, isWildcard, hasModulePermission } = usePermissionCheck();

  if (!notification) return null;

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
      <div className="min-h-full flex items-center justify-center">
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
