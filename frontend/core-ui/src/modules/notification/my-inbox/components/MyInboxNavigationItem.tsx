import { useUnreadNotificationCount } from '@/notification/my-inbox/hooks/useUnreadNotificationCount';
import { IconInbox } from '@tabler/icons-react';
import { Badge, NavigationMenuLinkItem, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const MyInboxNavigationItem = () => {
  const { t } = useTranslation();

  return (
    <NavigationMenuLinkItem
      path={'my-inbox'}
      name={t('My inbox')}
      icon={IconInbox}
      children={<NotificationCount />}
    />
  );
};

export const NotificationCount = () => {
  const { unreadNotificationsCount, loading } = useUnreadNotificationCount();
  if (loading) {
    return <Skeleton className="size-4 rounded-sm" />;
  }

  if (unreadNotificationsCount === 0) {
    return null;
  }

  return (
    <Badge className="ml-auto text-xs min-w-6 px-1 justify-center">
      {unreadNotificationsCount}
    </Badge>
  );
};
