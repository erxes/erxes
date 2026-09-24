'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { Popover } from 'erxes-ui/components/popover';
import { Toast } from 'erxes-ui/components/toasts';
import { toast } from 'erxes-ui/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useSession } from '@/modules/auth/components/SessionProvider';
import { Icon } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import { NOTIFICATION_PORTAL_MARK_ALL_READ } from '../graphql/mutations/notifications';
import { NOTIFICATION_PORTAL_LIST } from '../graphql/queries/notifications';
import type {
  MarkAllReadResponse,
  NotificationListResponse,
  PortalNotification,
} from '../types';
import { notificationTarget } from '../utils/notifications';
import { NotificationItem } from './NotificationItem';

const POLL_MS = 20_000;

const PANEL_LIMIT = 8;

const WATCH_LIMIT = 5;

const TOAST_VARIANTS: Record<string, 'success' | 'warning' | 'destructive'> = {
  success: 'success',
  warning: 'warning',
  error: 'destructive',
};

const freshnessKey = (entry: PortalNotification) =>
  `${entry._id}:${entry.updatedAt ?? entry.createdAt ?? ''}`;

const useArrivalToasts = (
  list: PortalNotification[] | null | undefined,
  accountId: string | null,
) => {
  const router = useRouter();
  const seen = useRef<Set<string> | null>(null);
  const account = useRef<string | null>(null);

  useEffect(() => {
    if (account.current !== accountId) {
      account.current = accountId;
      seen.current = null;
    }

    if (!list) {
      return;
    }

    const keys = list.map(freshnessKey);

    if (seen.current === null) {
      seen.current = new Set(keys);
      return;
    }

    const known = seen.current;
    const fresh = list.filter((_, index) => !known.has(keys[index]));

    seen.current = new Set(keys);

    if (!fresh.length) {
      return;
    }

    if (fresh.length > 1) {
      toast({
        title: `${fresh.length} new notifications`,
        description: 'Open the bell to read them.',
      });
      return;
    }

    const [arrival] = fresh;
    const { href } = notificationTarget(arrival);

    toast({
      variant: TOAST_VARIANTS[(arrival.type ?? '').toLowerCase()],
      title: arrival.title,
      description: arrival.message,
      action: href ? (
        <Toast.Action altText="Open" onClick={() => router.push(href)}>
          Open
        </Toast.Action>
      ) : undefined,
    });
  }, [list, accountId, router]);
};

const Panel = ({ onClose }: { onClose: () => void }) => {
  const { data, loading } = useQuery<NotificationListResponse>(
    NOTIFICATION_PORTAL_LIST,
    {
      variables: { limit: PANEL_LIMIT },
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
  );

  const [markAllRead, { loading: marking }] = useMutation<MarkAllReadResponse>(
    NOTIFICATION_PORTAL_MARK_ALL_READ,
    {
      refetchQueries: ['notificationPortalList'],
    },
  );

  const list = data?.clientPortalNotifications?.list ?? [];
  const hasUnread = list.some((entry) => !entry.isRead);

  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <p className="text-[13px] font-semibold text-ink">Notifications</p>

        {hasUnread ? (
          <button
            type="button"
            disabled={marking}
            onClick={() => void markAllRead().catch(() => undefined)}
            className="rounded-lg px-2 py-1 text-xs font-semibold text-brand outline-none transition-colors duration-300 ease-out-soft hover:bg-brand-soft focus-visible:bg-brand-soft disabled:opacity-60"
          >
            Mark all as read
          </button>
        ) : null}
      </div>

      <div className="max-h-96 overflow-y-auto p-1.5">
        {loading && !list.length ? (
          <div className="space-y-2 p-2">
            {[0, 1, 2].map((key) => (
              <div key={key} className="flex gap-3">
                <span className="size-9 shrink-0 animate-pulse rounded-xl bg-subtle" />
                <span className="flex-1 space-y-2 py-1">
                  <span className="block h-3 w-2/3 animate-pulse rounded bg-subtle" />
                  <span className="block h-3 w-full animate-pulse rounded bg-subtle" />
                </span>
              </div>
            ))}
          </div>
        ) : null}

        {!loading && !list.length ? (
          <div className="px-4 py-8 text-center">
            <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand">
              <Icon name="bell" size={20} />
            </span>
            <p className="mt-3 text-[13px] font-semibold text-ink">
              Nothing here yet
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Replies to your tickets and new announcements show up here.
            </p>
          </div>
        ) : null}

        {list.map((notification) => (
          <NotificationItem
            key={notification._id}
            notification={notification}
            onOpen={onClose}
          />
        ))}
      </div>

      <div className="border-t border-line px-4 py-2.5">
        <Link
          href="/account/notifications"
          onClick={onClose}
          className="flex items-center justify-center gap-1 rounded-lg py-1.5 text-[13px] font-semibold text-brand outline-none transition-colors duration-300 ease-out-soft hover:bg-brand-soft focus-visible:bg-brand-soft"
        >
          See all notifications
          <Icon name="chevronRight" size={14} />
        </Link>
      </div>
    </>
  );
};

export const NotificationBell = ({
  ringClass = 'ring-shell',
}: {
  ringClass?: string;
}) => {
  const { user, ready } = useSession();
  const [open, setOpen] = useState(false);

  const { data } = useQuery<NotificationListResponse>(
    NOTIFICATION_PORTAL_LIST,
    {
      variables: { limit: WATCH_LIMIT, status: 'UNREAD' },
      skip: !user,
      pollInterval: POLL_MS,
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
  );

  useArrivalToasts(
    user ? data?.clientPortalNotifications?.list : undefined,
    user?.cpUserId ?? null,
  );

  if (!ready || !user) {
    return null;
  }

  const unread = data?.clientPortalNotifications?.totalCount ?? 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        aria-label={
          unread ? `Notifications, ${unread} unread` : 'Notifications'
        }
        className="relative flex size-8 shrink-0 items-center justify-center rounded-lg text-white/60 outline-none transition-colors duration-300 ease-out-soft hover:bg-white/10 hover:text-white focus-visible:bg-white/10 data-[state=open]:bg-white/10 data-[state=open]:text-white"
      >
        <Icon name="bell" size={17} />

        {unread ? (
          <span
            className={cn(
              'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-white ring-2',
              ringClass,
            )}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </Popover.Trigger>

      <Popover.Content
        align="end"
        className="w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-line p-0 shadow-shell-hover"
      >
        <Panel onClose={() => setOpen(false)} />
      </Popover.Content>
    </Popover>
  );
};
