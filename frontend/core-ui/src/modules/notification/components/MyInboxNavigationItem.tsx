import { useUnreadNotificationCount } from '@/notification/hooks/useUnreadNotificationCount';
import { IconInbox } from '@tabler/icons-react';
import { Badge, NavigationMenuLinkItem, Skeleton } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const MyInboxNavigationItem = () => {
  const { t } = useTranslation('common', { keyPrefix: 'sidebar' });

  return (
    <NavigationMenuLinkItem
      path={'my-inbox'}
      name={t('my-inbox')}
      icon={IconInbox}
      children={<NotificationCount />}
    />
  );
};

export const NotificationCount = ({ dot = false }: { dot?: boolean }) => {
  const { unreadNotificationsCount, loading } = useUnreadNotificationCount();

  if (loading) {
    return dot ? null : <Skeleton className="size-4 rounded-sm" />;
  }

  if (unreadNotificationsCount === 0) {
    return null;
  }

  if (dot) {
    return (
      <span
        aria-hidden
        className="absolute top-1 right-1 size-1.5 rounded-full bg-primary ring-2 ring-sidebar"
      />
    );
  }

  return (
    <Badge className="ml-auto h-5 min-w-5 justify-center rounded-full px-1.5 text-[11px] tabular-nums">
      {unreadNotificationsCount}
    </Badge>
  );
};
