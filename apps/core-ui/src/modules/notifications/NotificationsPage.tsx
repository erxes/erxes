import { IconBell, IconChecks } from '@tabler/icons-react';
import { Button, PageContainer, PageSubHeader, ScrollArea, Tabs } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { NotificationList } from './NotificationList';
import { useNotificationActions, useNotificationList, useUnreadCount } from './useNotifications';

/** `/notifications`: the signed-in member's whole inbox. */
export const NotificationsPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const count = useUnreadCount();
  const list = useNotificationList({ unread: tab === 'unread' });
  const { markRead } = useNotificationActions();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb items={[{ label: t('inbox', 'Inbox'), to: '/notifications', icon: IconBell }]} />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="outline" disabled={!count || markRead.isPending} onClick={() => markRead.mutate({})}>
            <IconChecks />
            {t('mark-all-read', 'Mark all read')}
          </Button>
        </PageHeader.End>
      </PageHeader>
      <PageSubHeader className="items-center">
        <Tabs value={tab} onValueChange={(value) => setTab(value as 'all' | 'unread')}>
          <Tabs.List>
            <Tabs.Trigger value="all">{t('all', 'All')}</Tabs.Trigger>
            <Tabs.Trigger value="unread">
              {t('unread', 'Unread')}
              {count > 0 && <span className="ml-1 text-xs text-muted-foreground">{count}</span>}
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
      </PageSubHeader>
      <ScrollArea className="flex-1">
        <div className="mx-auto w-full max-w-3xl py-3">
          <NotificationList {...list} unreadOnly={tab === 'unread'} />
        </div>
      </ScrollArea>
    </PageContainer>
  );
};
