'use client';

import { useMutation, useQuery } from '@apollo/client/react';
import { useState } from 'react';
import {
  AccountAside,
  accountColumns,
  accountShell,
} from '@/modules/auth/components/AccountAside';
import {
  AccountLoadError,
  AccountPanelSkeleton,
} from '@/modules/auth/components/AccountStates';
import { AUTH_PORTAL_CURRENT_USER } from '@/modules/auth/graphql/queries/auth';
import { displayName, type CurrentUserResponse } from '@/modules/auth/types';
import { Button } from '@/modules/ui/components/Button';
import { Icon } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import { NOTIFICATION_PORTAL_MARK_ALL_READ } from '../graphql/mutations/notifications';
import { NOTIFICATION_PORTAL_LIST } from '../graphql/queries/notifications';
import type { MarkAllReadResponse, NotificationListResponse } from '../types';
import { NotificationItem } from './NotificationItem';

const PAGE_SIZE = 20;

const FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'UNREAD', label: 'Unread' },
] as const;

type Filter = (typeof FILTERS)[number]['key'];

const Feed = () => {
  const [filter, setFilter] = useState<Filter>('ALL');
  const [limit, setLimit] = useState(PAGE_SIZE);

  const { data, loading } = useQuery<NotificationListResponse>(
    NOTIFICATION_PORTAL_LIST,
    {
      variables: {
        limit,
        status: filter === 'UNREAD' ? 'UNREAD' : undefined,
      },
      fetchPolicy: 'cache-and-network',
      notifyOnNetworkStatusChange: true,
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
  const total = data?.clientPortalNotifications?.totalCount ?? list.length;
  const hasUnread = list.some((entry) => !entry.isRead);
  const busy = loading && !list.length;

  const choose = (next: Filter) => {
    setFilter(next);
    setLimit(PAGE_SIZE);
  };

  return (
    <section className={accountShell}>
      <div className="flex items-start gap-3.5 border-b border-line px-6 py-5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Icon name="bell" size={19} />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-ink">Notifications</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Ticket replies, announcements and everything else the portal sends
            you.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-3.5">
        <div className="flex rounded-xl bg-subtle p-1">
          {FILTERS.map((entry) => (
            <button
              key={entry.key}
              type="button"
              onClick={() => choose(entry.key)}
              className={cn(
                'rounded-lg px-3 py-1.5 text-[13px] font-semibold outline-none transition-colors duration-300 ease-out-soft',
                filter === entry.key
                  ? 'bg-white text-ink shadow-card'
                  : 'text-muted-foreground hover:text-ink',
              )}
            >
              {entry.label}
            </button>
          ))}
        </div>

        {hasUnread ? (
          <button
            type="button"
            disabled={marking}
            onClick={() => void markAllRead().catch(() => undefined)}
            className="rounded-lg px-2.5 py-1.5 text-[13px] font-semibold text-brand outline-none transition-colors duration-300 ease-out-soft hover:bg-brand-soft focus-visible:bg-brand-soft disabled:opacity-60"
          >
            Mark all as read
          </button>
        ) : null}
      </div>

      {busy ? (
        <div className="space-y-4 px-6 py-6">
          {[0, 1, 2, 3].map((key) => (
            <div key={key} className="flex gap-3">
              <span className="size-9 shrink-0 animate-pulse rounded-xl bg-subtle" />
              <span className="flex-1 space-y-2 py-1">
                <span className="block h-3.5 w-1/3 animate-pulse rounded bg-subtle" />
                <span className="block h-3.5 w-3/4 animate-pulse rounded bg-subtle" />
              </span>
            </div>
          ))}
        </div>
      ) : null}

      {!busy && !list.length ? (
        <div className="px-6 py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
            <Icon name="bell" size={22} />
          </span>
          <p className="mt-4 text-[15px] font-semibold text-ink">
            {filter === 'UNREAD' ? 'Nothing unread' : 'No notifications yet'}
          </p>
          <p className="mx-auto mt-1.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {filter === 'UNREAD'
              ? 'You have read everything the portal has sent you.'
              : 'Replies to your tickets and new announcements will show up here.'}
          </p>
        </div>
      ) : null}

      {list.length ? (
        <div className="divide-y divide-line px-3 py-2">
          {list.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
            />
          ))}
        </div>
      ) : null}

      {list.length < total ? (
        <div className="flex justify-center border-t border-line bg-subtle/60 px-6 py-4">
          <Button
            variant="secondary"
            size="sm"
            disabled={loading}
            onClick={() => setLimit((current) => current + PAGE_SIZE)}
          >
            {loading ? 'Loading…' : `Load more (${total - list.length} left)`}
          </Button>
        </div>
      ) : null}
    </section>
  );
};

export const NotificationsPanel = () => {
  const { data, loading, error } = useQuery<CurrentUserResponse>(
    AUTH_PORTAL_CURRENT_USER,
    { errorPolicy: 'all' },
  );

  const current = data?.clientPortalCurrentUser ?? null;

  if (loading && !current) {
    return <AccountPanelSkeleton />;
  }

  if (!current) {
    return <AccountLoadError message={error?.message} />;
  }

  return (
    <div className={accountColumns}>
      <AccountAside
        name={displayName(current)}
        email={current.email ?? ''}
        isVerified={current.isVerified}
        avatar={current.avatar}
      />

      <Feed />
    </div>
  );
};
