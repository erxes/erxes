import { IconBell, IconChecks, IconInbox } from '@tabler/icons-react';
import { Button, cn, Popover, ScrollArea, Tabs } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useLiveMode } from '~/lib/live';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { coreTabIconClassName } from '~/modules/navigation/coreTabClassName';
import { CoreTabTooltip } from '~/modules/navigation/CoreTabTooltip';
import { NotificationList } from './NotificationList';
import {
  useInboxes,
  useNotificationActions,
  useNotificationList,
  useUnreadCounts,
} from './useNotifications';

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
  const mode = useLiveMode();

  // "(3) erxes": the unread count in the browser tab, as Slack and Gmail do.
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\+?\) /, '');

    document.title = count ? `(${count > 99 ? '99+' : count}) ${base}` : base;
  }, [count]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <CoreTabTooltip label={t('title', 'Notifications')}>
        <Popover.Trigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={
              count
                ? t('title-unread', { count, defaultValue: `Notifications, ${count} unread` })
                : t('title', 'Notifications')
            }
            className={cn(coreTabIconClassName(open), 'relative')}
          >
            <IconBell className="size-4" />
            {/* Changes aren't pushed right now (reconnecting, or the server can't listen): counts refresh every 30 s. */}
            {mode === 'polling' && (
              <span
                className="absolute bottom-1 right-1 size-1.5 rounded-full bg-amber-500"
                title={t('polling', 'Live updates paused; refreshing every 30 seconds')}
              />
            )}
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
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              asChild
              aria-label={t('open-inbox', 'Open inbox')}
            >
              <Link
                to={source ? `/notifications/${source}` : '/notifications'}
                onClick={() => setOpen(false)}
              >
                <IconInbox className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
        {/* Tabs reach the line: the active underline sits on it. */}
        <div className="flex items-stretch justify-between gap-2 border-b px-2">
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as 'all' | 'unread')}
            className="flex"
          >
            <Tabs.List className="flex min-h-9 items-stretch self-stretch rounded-none border-0 py-0">
              <Tabs.Trigger value="all" className="after:-mb-px">
                {t('all', 'All')}
              </Tabs.Trigger>
              <Tabs.Trigger value="unread" className="after:-mb-px">
                {t('unread', 'Unread')}
                {unreadHere > 0 && (
                  <span className="ml-1 text-xs text-muted-foreground">{unreadHere}</span>
                )}
              </Tabs.Trigger>
            </Tabs.List>
          </Tabs>
          {/* One chip per inbox (erxes, then each plugin), like Atlassian's product filter. */}
          {inboxes.length > 1 && (
            <div className="flex min-w-0 items-center gap-1 self-center overflow-x-auto py-1.5">
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
                      active
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent',
                    )}
                  >
                    <Icon className="size-3" />
                    {inbox.label}
                    {(bySource[inbox.source] ?? 0) > 0 && (
                      <span className="font-semibold">{bySource[inbox.source]}</span>
                    )}
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
