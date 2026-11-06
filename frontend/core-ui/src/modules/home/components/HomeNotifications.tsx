import {
  DashboardWidgetEmptyState,
  DashboardWidgetListSkeleton,
  DashboardWidgetCard,
} from 'ui-modules';

import { AppPath } from '@/types/paths/AppPath';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { NotificationItem } from '@/notification/components/NotificationItem';
import { useNotifications } from '@/notification/hooks/useNotifications';
import { useTranslation } from 'react-i18next';

const HOME_NOTIFICATIONS_LIMIT = 6;

// Home has no inbox multi-select; the item's link opens it in the inbox.
const openNotification = () => undefined;

/** Latest unread notifications; live through the inbox subscription. */
export const HomeNotifications = () => {
  const { notifications, loading } = useNotifications({
    variables: { limit: HOME_NOTIFICATIONS_LIMIT },
  });
  const { t } = useTranslation('common', { keyPrefix: 'home' });

  const renderContent = () => {
    if (loading && notifications.length === 0) {
      return <DashboardWidgetListSkeleton />;
    }

    if (notifications.length === 0) {
      return (
        <DashboardWidgetEmptyState>
          {t('notifications-empty')}
        </DashboardWidgetEmptyState>
      );
    }

    return (
      <div className="flex flex-col gap-1">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification._id}
            {...notification}
            selected={false}
            selectionFocused={false}
            onOpen={openNotification}
          />
        ))}
      </div>
    );
  };

  return (
    <DashboardWidgetCard
      title={t('notifications')}
      action={
        <Button asChild size="sm" variant="ghost">
          <Link to={`/${AppPath.MyInbox}`}>{t('view-all')}</Link>
        </Button>
      }
    >
      {renderContent()}
    </DashboardWidgetCard>
  );
};
