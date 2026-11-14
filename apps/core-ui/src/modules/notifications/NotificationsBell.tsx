import { IconBell, IconChecks, IconInbox } from '@tabler/icons-react';
import { Button, cn, Popover, ScrollArea, buttonVariants } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { useLiveMode } from '~/lib/live';
import { CoreTabTooltip } from '~/modules/navigation/CoreTabTooltip';
import { NotificationList } from './NotificationList';
import { type NotificationTab, NotificationTabs } from './NotificationTabs';
import {
  type Inbox,
  useInboxes,
  useNotificationActions,
  useNotificationList,
  useUnreadCounts,
} from './useNotifications';

/** "(3) erxes": the unread count in the browser tab, as Slack and Gmail do. */
const useUnreadTitle = (count: number) => {
  useEffect(() => {
    const base = document.title.replace(/^\(\d+\+?\) /, '');

    document.title = count ? `(${count > 99 ? '99+' : count}) ${base}` : base;
  }, [count]);
};

/** The unread count, and a dot while changes are polled instead of pushed. */
const BellIndicators = ({ count }: { count: number }) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  const mode = useLiveMode();

  return (
    <>
      {/* Reconnecting, or the server can't listen: counts refresh every 30 s. */}
      {mode === 'polling' && (
        <span
          className="absolute bottom-1 right-1 size-1.5 rounded-full bg-warning"
          title={t('polling', 'Live updates paused; refreshing every 30 seconds')}
        />
      )}
      {count > 0 && (
        <span className="absolute top-1 right-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-3xs leading-none font-semibold text-destructive-foreground">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </>
  );
};

/** Mark the shown inbox read, and open it in full. */
const BellHeader = ({
  source,
  unread,
  onLeave,
}: {
  source?: string;
  unread: number;
  onLeave: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  const { markRead } = useNotificationActions();

  return (
    <div className="flex items-center justify-between border-b px-3 py-2">
      <span className="text-sm font-semibold">{t('title', 'Notifications')}</span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={!unread || markRead.isPending}
          onClick={() => markRead.mutate({ source })}
        >
          <IconChecks className="size-4" />
          {t('mark-all-read', 'Mark all read')}
        </Button>
        <Link
          to={source ? `/notifications/${source}` : '/notifications'}
          onClick={onLeave}
          aria-label={t('open-inbox', 'Open inbox')}
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-7')}
        >
          <IconInbox className="size-4" />
        </Link>
      </div>
    </div>
  );
};

/** One chip per inbox (erxes, then each plugin), like Atlassian's product filter. */
const InboxChips = ({
  inboxes,
  source,
  bySource,
  onChange,
}: {
  inboxes: Inbox[];
  source?: string;
  bySource: Record<string, number>;
  onChange: (source: string | undefined) => void;
}) => (
  <div className="flex min-w-0 items-center gap-1 self-center overflow-x-auto py-1.5">
    {inboxes.map((inbox) => {
      const Icon = inbox.icon;
      const active = source === inbox.source;
      const unread = bySource[inbox.source] ?? 0;

      return (
        <button
          key={inbox.source}
          type="button"
          title={inbox.label}
          aria-pressed={active}
          onClick={() => onChange(active ? undefined : inbox.source)}
          className={cn(
            'flex h-6 shrink-0 items-center gap-1 rounded-full border px-2 text-xs',
            active
              ? 'border-primary bg-primary/10 text-primary-text'
              : 'text-muted-foreground hover:bg-accent',
          )}
        >
          <Icon className="size-3" />
          {inbox.label}
          {unread > 0 && <span className="font-semibold">{unread}</span>}
        </button>
      );
    })}
  </div>
);

/**
 * The top bar's inbox: unread count, the latest notifications from every
 * inbox (or one: erxes, HR, …), mark read, and the way to the full inbox.
 */
export const NotificationsBell = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<NotificationTab>('all');
  const [source, setSource] = useState<string | undefined>();
  const { count, bySource } = useUnreadCounts();
  const inboxes = useInboxes();
  const list = useNotificationList({ source, unread: tab === 'unread', enabled: open });
  const unreadHere = source ? (bySource[source] ?? 0) : count;

  useUnreadTitle(count);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <CoreTabTooltip label={t('title', 'Notifications')}>
        <Popover.Trigger
          render={
            <Button
              type="button"
              size="icon"
              variant="nav"
              aria-label={
                count
                  ? t('title-unread', { count, defaultValue: `Notifications, ${count} unread` })
                  : t('title', 'Notifications')
              }
              className="relative shrink-0"
            />
          }
        >
          <IconBell className="size-4" />
          <BellIndicators count={count} />
        </Popover.Trigger>
      </CoreTabTooltip>
      <Popover.Content align="end" variant="flush" className="w-104">
        <BellHeader source={source} unread={unreadHere} onLeave={() => setOpen(false)} />
        <div className="flex items-stretch justify-between gap-2 border-b px-2">
          <NotificationTabs value={tab} onChange={setTab} unread={unreadHere} />
          {inboxes.length > 1 && (
            <InboxChips
              inboxes={inboxes}
              source={source}
              bySource={bySource}
              onChange={setSource}
            />
          )}
        </div>
        <ScrollArea className="max-h-112">
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
