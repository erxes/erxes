import {
  HomeEmptyState,
  HomeListSkeleton,
  HomeSection,
} from '@/home/components/HomeSection';

import { AppPath } from '@/types/paths/AppPath';
import { Button } from 'erxes-ui';
import { Link } from 'react-router-dom';
import { NotificationFeed } from '@/notification/components/NotificationFeed';
import { useNotifications } from '@/notification/hooks/useNotifications';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { NotificationTabs } from '@/notification/components/NotificationTabs';
import type { NotificationTabValue } from '@/notification/types/myInbox';

const HOME_NOTIFICATIONS_LIMIT = 6;

// Home has no inbox multi-select; the item's link opens it in the inbox.
const openNotification = () => undefined;

/** Recent unread and seen notifications; live through the inbox subscription. */
export const HomeNotifications = () => {
  const [tab, setTab] = useState<NotificationTabValue>('unread');
  const unread = useNotifications({
    variables: { limit: HOME_NOTIFICATIONS_LIMIT, status: 'UNREAD' },
  });
  const seen = useNotifications({
    variables: {
      limit: HOME_NOTIFICATIONS_LIMIT,
      status: 'READ',
      unreadFirst: false,
    },
  });
  const { t } = useTranslation('common', { keyPrefix: 'home' });
  const active = tab === 'read' ? seen : unread;
  const notifications = active.notifications.filter((item) =>
    tab === 'read' ? item.isRead : !item.isRead,
  );

  const renderContent = () => {
    if (active.loading && notifications.length === 0) {
      return <HomeListSkeleton />;
    }

    if (notifications.length === 0 && !active.error) {
      return <HomeEmptyState>{t('notifications-empty')}</HomeEmptyState>;
    }

    return (
      <div className="flex flex-col gap-1">
        {active.error && (
          <div role="alert" className="text-xs text-destructive">
            {t('notifications-load-failed', 'Unable to load notifications')}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void active.retry()}
            >
              {t('retry', 'Retry')}
            </Button>
          </div>
        )}
        <NotificationFeed
          groups={[['', notifications]]}
          onOpen={openNotification}
        />
      </div>
    );
  };

  return (
    <HomeSection
      title={t('notifications')}
      action={
        <Button asChild size="sm" variant="ghost">
          <Link to={`/${AppPath.MyInbox}`}>{t('view-all')}</Link>
        </Button>
      }
    >
      <NotificationTabs
        value={tab}
        onValueChange={setTab}
        unreadCount={
          unread.loading || unread.error ? undefined : unread.totalCount
        }
        seenCount={seen.loading || seen.error ? undefined : seen.totalCount}
      >
        {renderContent()}
      </NotificationTabs>
    </HomeSection>
  );
};
