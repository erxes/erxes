import { CoreNotificationContent } from '@/notification/my-inbox/components/contents/CoreNotificationContent';
import { SystemNotificationContents } from '@/notification/my-inbox/components/contents/system/SystemNotificationContents';
import { UnknownSystemNotificationContent } from '@/notification/my-inbox/components/contents/system/UnknownSystemNotificationContent';
import { NoNotificationSelected } from '@/notification/my-inbox/components/NoNotificationSelected';
import { useNotification } from '@/notification/my-inbox/hooks/useNotification';
import {
  INotification,
  INotificationKind,
} from '@/notification/my-inbox/types/notifications';
import { ScrollArea, Spinner } from 'erxes-ui';
import { Suspense } from 'react';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';
import { WelcomeMessageNotificationContent } from '@/notification/my-inbox/components/contents/system/WelcomeMessage';
import { currentUserState } from 'ui-modules';
import { useAtomValue } from 'jotai';

export const NotificationContent = () => {
  const { notification, loading } = useNotification();
  const currentUser = useAtomValue(currentUserState);
  console.log({ notification, currentUser });

  if (loading) {
    return <Spinner />;
  }

  if (!notification) {
    return <NoNotificationSelected />;
  }

  return (
    <ScrollArea className="overflow-hidden h-full">
      <NotificationContentWrapper notification={notification} />
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
