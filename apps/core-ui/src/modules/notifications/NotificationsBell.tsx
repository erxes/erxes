import { IconBell, IconChecks, IconInbox } from '@tabler/icons-react';
import { Button, cn, Popover, ScrollArea, Tabs } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { coreTabIconClassName } from '~/modules/navigation/coreTabClassName';
import { CoreTabTooltip } from '~/modules/navigation/CoreTabTooltip';
import { NotificationList } from './NotificationList';
import { useNotificationActions, useNotificationList, useUnreadCount } from './useNotifications';

/** The top bar's inbox: unread count, latest notifications, mark all read. */
export const NotificationsBell = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'all' | 'unread'>('all');
  const count = useUnreadCount();
  const list = useNotificationList({ unread: tab === 'unread', enabled: open });
  const { markRead } = useNotificationActions();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <CoreTabTooltip label={t('title', 'Notifications')}>
        <Popover.Trigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            aria-label={count ? t('title-unread', { count, defaultValue: `Notifications, ${count} unread` }) : t('title', 'Notifications')}
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
      <Popover.Content align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">{t('title', 'Notifications')}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={!count || markRead.isPending}
              onClick={() => markRead.mutate({})}
            >
              <IconChecks className="size-4" />
              {t('mark-all-read', 'Mark all read')}
            </Button>
            <Button variant="ghost" size="icon" className="size-7" asChild aria-label={t('open-inbox', 'Open inbox')}>
              <Link to="/notifications" onClick={() => setOpen(false)}>
                <IconInbox className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
        <Tabs value={tab} onValueChange={(value) => setTab(value as 'all' | 'unread')}>
          <Tabs.List className="w-full justify-start rounded-none border-b px-2">
            <Tabs.Trigger value="all">{t('all', 'All')}</Tabs.Trigger>
            <Tabs.Trigger value="unread">
              {t('unread', 'Unread')}
              {count > 0 && <span className="ml-1 text-xs text-muted-foreground">{count}</span>}
            </Tabs.Trigger>
          </Tabs.List>
        </Tabs>
        <ScrollArea className="max-h-[28rem]">
          <NotificationList {...list} unreadOnly={tab === 'unread'} onOpen={() => setOpen(false)} compact />
        </ScrollArea>
      </Popover.Content>
    </Popover>
  );
};
