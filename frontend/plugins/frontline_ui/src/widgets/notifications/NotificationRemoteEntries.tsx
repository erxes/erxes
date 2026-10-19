import { Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { NotificationContent } from '~/widgets/notifications/system/NotficationContent';
import { type TNotification } from 'ui-modules';
import { NotificationContentUnavailable } from '~/widgets/notifications/my-inbox/components/NotificationContentUnavailable';
import { TicketNotificationView } from '~/widgets/notifications/my-inbox/components/TicketNotificationView';

export { GenericErrorFallback } from '~/widgets/automations/components/AutomationRemoteEntry';

const NotificationConversationDetail = lazy(() =>
  import(
    '~/widgets/notifications/my-inbox/components/NotificationConversationDetail'
  ).then((module) => ({
    default: module.NotificationConversationDetail,
  })),
);

const NotificationChannelContent = lazy(() =>
  import(
    '~/widgets/notifications/my-inbox/components/NotificationChannelContent'
  ).then((module) => ({
    default: module.NotificationChannelContent,
  })),
);

export const NotificationRemoteEntries = (props: TNotification) => {
  const { t } = useTranslation('frontline');
  const { contentTypeId, contentType } = props;
  const [, moduleName, type] = (contentType || '').replace(':', '.').split('.');

  const isFacebookBotHealthNotification =
    moduleName === 'facebook' && type === 'bot_health';

  if (isFacebookBotHealthNotification) {
    const FacebookBotHealth = NotificationContent.facebookBotHealth;

    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-4">
            {t('loading', 'Loading...')}
          </div>
        }
      >
        <FacebookBotHealth {...props} />
      </Suspense>
    );
  }

  if (moduleName === 'system' && type) {
    const NotificationComponent =
      NotificationContent[type as keyof typeof NotificationContent];

    if (!NotificationComponent) {
      return (
        <div>
          {t('no-notification-component', 'No notification component found')}
        </div>
      );
    }

    return <NotificationComponent {...props} />;
  }

  if (!contentTypeId) {
    return <NotificationContentUnavailable />;
  }

  if (
    moduleName === 'channel' ||
    (moduleName === 'inbox' && type === 'channel')
  ) {
    return (
      <Suspense fallback={<Spinner containerClassName="h-full" />}>
        <NotificationChannelContent {...props} />
      </Suspense>
    );
  }

  if (moduleName === 'inbox') {
    return (
      <div className="h-full min-h-0 flex flex-col overflow-hidden">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Suspense fallback={<Spinner containerClassName="h-full" />}>
            <NotificationConversationDetail contentTypeId={contentTypeId} />
          </Suspense>
        </div>
      </div>
    );
  }

  return <TicketNotificationView contentTypeId={contentTypeId} />;
};
