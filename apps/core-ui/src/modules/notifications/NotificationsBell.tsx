import { IconBell, IconChecks, IconInbox } from '@tabler/icons-react';
import { Button, cn, Popover, ScrollArea, Tabs } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { coreTabIconClassName } from '~/modules/navigation/coreTabClassName';
import { CoreTabTooltip } from '~/modules/navigation/CoreTabTooltip';
import { NotificationList } from './NotificationList';
import { useInboxes, useNotificationActions, useNotificationList, useUnreadCounts } from './useNotifications';

/**
 * The top bar's inbox: unread count, the latest notifications from every
 * inbox (or one: erxes, HR, …), mark read, and the way to the full inbox.
 */
export const NotificationsBell = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const [source, setSource] = useState<string | undefined>();
  const { count, bySource } = useUnreadCounts();
  const inboxes = useInboxes();
  const list = useNotificationList({ source, unread: tab === 'unread', enabled: open });
  const { markRead } = useNotificationActions();
  const unreadHere = source ? (bySource[source] ?? 0) : count;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <CoreTabTooltip label={t('title', 'Notifications')}>
        <Popover.Trigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={
              count ? t('title-unread', { count, defaultValue: `Notifications, ${count} unread` }) : t('title', 'Notifications')
            }
            className={cn(coreTabIconClassName(open), 'relative')}
          >
            <IconBell className="size-4" />
            {count > 0 && (
              <span className="absolute top-1 right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-[9px] leading-none font-semibold text-destructive-foreground">
                {count > 99 ? '99+' : count}
              </span>
            )}
          </Button>
        </Popover.Trigger>
      </CoreTabTooltip>
      <Popover.Content align="end" className="w-[26rem] p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">{t('title', 'Notifications')}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={!unreadHere || markRead.isPending}
              onClick={() => markRead.mutate({ source })}
            >
              <IconChecks className="size-4" />
              {t('mark-all-read', 'Mark all read')}
            </Button>
            <Button variant="ghost" size="icon" className="size-7" asChild aria-label={t('open-inbox', 'Open inbox')}>
              <Link to={source ? `/notifications/${source}` : '/notifications'} onClick={() => setOpen(false)}>
                <IconInbox className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 border-b px-2">
          <Tabs value={tab} onValueChange={(value) => setTab(value as 'all' | 'unread')}>
            <Tabs.List className="rounded-none border-0">
              <Tabs.Trigger value="all">{t('all', 'All')}</Tabs.Trigger>
              <Tabs.Trigger value="unread">
                {t('unread', 'Unread')}
                {unreadHere > 0 && <span className="ml-1 text-xs text-muted-foreground">{unreadHere}</span>}
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>
          {/* One chip per inbox (erxes, then each plugin), like Atlassian's product filter. */}
          {inboxes.length > 1 && (
            <div className="flex min-w-0 gap-1 overflow-x-auto py-1.5">
              {inboxes.map((inbox) => {
                const Icon = inbox.icon;
                const active = source === inbox.source;

                return (
                  <button
                    key={inbox.source}
                    type="button"
                    title={inbox.label}
                    onClick={() => setSource(active ? undefined : inbox.source)}
                    className={cn(
                      'flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-xs',
                      active ? 'border-primary bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent',
                    )}
                  >
                    <Icon className="size-3" />
                    {inbox.label}
                    {(bySource[inbox.source] ?? 0) > 0 && <span className="font-semibold">{bySource[inbox.source]}</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
        <ScrollArea className="max-h-[28rem]">
          <NotificationList
            {...list}
            inboxes={inboxes}
            unreadOnly={tab === 'unread'}
            onOpen={() => setOpen(false)}
            compact
          />
        </ScrollArea>
      </Popover.Content>
    </Popover>
  );
};
