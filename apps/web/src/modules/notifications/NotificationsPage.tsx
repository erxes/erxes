import { paths } from '~/lib/paths';
import { IconBell, IconChecks, IconSettings } from '@tabler/icons-react';
import {
  Button,
  PageContainer,
  PageHeader,
  PageSubHeader,
  ScrollArea,
  Switch,
  buttonVariants,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { InboxNav } from './InboxNav';
import { NotificationList } from './NotificationList';
import { type NotificationTab, NotificationTabs } from './NotificationTabs';
import {
  useInboxes,
  useNotificationActions,
  useNotificationList,
  useUnreadCounts,
} from './useNotifications';

/** Settings, and mark everything shown read. */
const PageActions = ({ source, unread }: { source?: string; unread: number }) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  const { markRead } = useNotificationActions();

  return (
    <PageHeader.End>
      <Link to={paths.settings.notifications} className={buttonVariants({ variant: 'ghost' })}>
        <IconSettings />
        {t('settings-link', 'Settings')}
      </Link>
      <Button
        variant="outline"
        disabled={!unread || markRead.isPending}
        onClick={() => markRead.mutate({ source })}
      >
        <IconChecks />
        {t('mark-all-read', 'Mark all read')}
      </Button>
    </PageHeader.End>
  );
};

/**
 * `/notifications`: every inbox in one place, like Atlassian's — erxes' own
 * and one per plugin. `/notifications/<plugin>` is that plugin's inbox, which
 * a plugin can link to from its own navigation.
 */
export const NotificationsPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  const { source } = useParams<{ source?: string }>();
  const [tab, setTab] = useState<NotificationTab>('all');
  const [important, setImportant] = useState(false);
  const { count, bySource } = useUnreadCounts();
  const inboxes = useInboxes();
  const inbox = inboxes.find((item) => item.source === source);
  const list = useNotificationList({ source, unread: tab === 'unread', important });
  const unreadHere = source ? (bySource[source] ?? 0) : count;
  const title = inbox?.label ?? (source ? source : t('all-inboxes', 'All inboxes'));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('inbox', 'Inbox'), to: paths.notifications, icon: IconBell },
              ...(source ? [{ label: title, to: paths.notificationSource(source) }] : []),
            ]}
          />
        </PageHeader.Start>
        <PageActions source={source} unread={unreadHere} />
      </PageHeader>
      <div className="flex min-h-0 flex-1">
        <InboxNav inboxes={inboxes} source={source} count={count} bySource={bySource} />
        <div className="flex min-w-0 flex-1 flex-col">
          <PageSubHeader variant="flush" className="items-center">
            <NotificationTabs
              value={tab}
              onChange={setTab}
              unread={unreadHere}
              className="self-stretch"
            />
            <label className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
              <Switch checked={important} onCheckedChange={setImportant} />
              {t('important-only', 'Important only')}
            </label>
          </PageSubHeader>
          <ScrollArea className="flex-1">
            <div className="mx-auto w-full max-w-3xl pb-6">
              <NotificationList {...list} inboxes={inboxes} unreadOnly={tab === 'unread'} />
            </div>
          </ScrollArea>
        </div>
      </div>
    </PageContainer>
  );
};
