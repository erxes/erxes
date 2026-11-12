import { IconBell, IconChecks, IconInbox, IconSettings } from '@tabler/icons-react';
import { Button, cn, PageContainer, PageSubHeader, ScrollArea, Switch, Tabs } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { PageHeader } from 'ui-modules';
import { AppBreadcrumb } from '~/components/AppBreadcrumb';
import { NotificationList } from './NotificationList';
import { useInboxes, useNotificationActions, useNotificationList, useUnreadCounts } from './useNotifications';

const Count = ({ value, active }: { value: number; active?: boolean }) =>
  value > 0 ? (
    <span
      className={cn(
        'ml-auto rounded-full px-1.5 text-xs font-medium',
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
      )}
    >
      {value > 99 ? '99+' : value}
    </span>
  ) : null;

/**
 * `/notifications`: every inbox in one place, like Atlassian's — erxes' own
 * and one per plugin. `/notifications/<plugin>` is that plugin's inbox, which
 * a plugin can link to from its own navigation.
 */
export const NotificationsPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  const { source } = useParams<{ source?: string }>();
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [important, setImportant] = useState(false);
  const { count, bySource } = useUnreadCounts();
  const inboxes = useInboxes();
  const inbox = inboxes.find((item) => item.source === source);
  const list = useNotificationList({ source, unread: tab === 'unread', important });
  const { markRead } = useNotificationActions();
  const unreadHere = source ? (bySource[source] ?? 0) : count;
  const title = inbox?.label ?? (source ? source : t('all-inboxes', 'All inboxes'));

  return (
    <PageContainer>
      <PageHeader>
        <PageHeader.Start>
          <AppBreadcrumb
            items={[
              { label: t('inbox', 'Inbox'), to: '/notifications', icon: IconBell },
              ...(source ? [{ label: title, to: `/notifications/${source}` }] : []),
            ]}
          />
        </PageHeader.Start>
        <PageHeader.End>
          <Button variant="ghost" asChild>
            <Link to="/settings/notifications">
              <IconSettings />
              {t('settings-link', 'Settings')}
            </Link>
          </Button>
          <Button
            variant="outline"
            disabled={!unreadHere || markRead.isPending}
            onClick={() => markRead.mutate({ source })}
          >
            <IconChecks />
            {t('mark-all-read', 'Mark all read')}
          </Button>
        </PageHeader.End>
      </PageHeader>
      <div className="flex min-h-0 flex-1">
        <nav className="flex w-56 shrink-0 flex-col gap-0.5 border-r bg-sidebar p-2" aria-label={t('inboxes', 'Inboxes')}>
          <Link
            to="/notifications"
            className={cn(
              'flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-accent',
              !source && 'bg-accent font-medium',
            )}
          >
            <IconInbox className="size-4 text-muted-foreground" />
            {t('all-inboxes', 'All inboxes')}
            <Count value={count} active={!source} />
          </Link>
          <p className="px-2 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase">{t('inboxes', 'Inboxes')}</p>
          {inboxes.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.source}
                to={`/notifications/${item.source}`}
                className={cn(
                  'flex h-8 items-center gap-2 rounded-md px-2 text-sm hover:bg-accent',
                  source === item.source && 'bg-accent font-medium',
                )}
              >
                <Icon className="size-4 text-primary" />
                <span className="truncate">{item.label}</span>
                <Count value={bySource[item.source] ?? 0} active={source === item.source} />
              </Link>
            );
          })}
        </nav>
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Tabs flush with the header's line: the active underline sits on it. */}
          <PageSubHeader className="items-center gap-3 py-0">
            <Tabs value={tab} onValueChange={(value) => setTab(value as 'all' | 'unread')} className="flex self-stretch">
              <Tabs.List className="flex min-h-9 items-stretch self-stretch border-b-0 py-0">
                <Tabs.Trigger value="all" className="after:-mb-px">{t('all', 'All')}</Tabs.Trigger>
                <Tabs.Trigger value="unread" className="after:-mb-px">
                  {t('unread', 'Unread')}
                  {unreadHere > 0 && <span className="ml-1 text-xs text-muted-foreground">{unreadHere}</span>}
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
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
