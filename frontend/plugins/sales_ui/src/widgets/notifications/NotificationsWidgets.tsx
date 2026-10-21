import { useTranslation } from 'react-i18next';
import { type TNotification } from 'ui-modules';
import { NotificationContentUnavailable } from '~/widgets/notifications/my-inbox/components/NotificationContentUnavailable';
import { SalesDealNotificationContent } from '~/widgets/notifications/my-inbox/components/SalesDealNotificationContent';

export const NotificationsWidgets = (props: TNotification) => {
  const { t } = useTranslation('sales');
  const [, moduleName] = (props.contentType || '').replace(':', '.').split('.');

  if (
    moduleName === 'deal' ||
    moduleName === 'deals' ||
    moduleName === 'note'
  ) {
    return <SalesDealNotificationContent {...props} />;
  }

  return (
    <NotificationContentUnavailable
      title={t(
        'notification-content-unavailable',
        'Notification content unavailable',
      )}
      description={t(
        'notification-no-detail-view',
        'This sales notification does not have a linked detail view yet.',
      )}
    />
  );
};
