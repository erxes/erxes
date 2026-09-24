'use client';

import { useMutation } from '@apollo/client/react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { Icon } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import { NOTIFICATION_PORTAL_MARK_READ } from '../graphql/mutations/notifications';
import type { MarkReadResponse, PortalNotification } from '../types';
import {
  notificationTarget,
  notificationTone,
  relativeTime,
} from '../utils/notifications';

const row =
  'flex w-full gap-3 rounded-xl px-3 py-3 text-left outline-none transition-colors duration-300 ease-out-soft';

export const NotificationItem = ({
  notification,
  onOpen,
}: {
  notification: PortalNotification;
  onOpen?: () => void;
}) => {
  const { href, icon } = notificationTarget(notification);

  const [markRead] = useMutation<MarkReadResponse>(
    NOTIFICATION_PORTAL_MARK_READ,
    {
      variables: { id: notification._id },
      refetchQueries: ['notificationPortalList'],
      update: (cache) => {
        cache.modify({
          id: cache.identify({
            __typename: 'CPNotification',
            _id: notification._id,
          }),
          fields: { isRead: () => true },
        });
      },
    },
  );

  const read = () => {
    if (!notification.isRead) {
      void markRead().catch(() => undefined);
    }

    onOpen?.();
  };

  const body: ReactNode = (
    <>
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-xl',
          notificationTone(notification),
        )}
      >
        <Icon name={icon} size={17} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-start gap-2">
          <span
            className={cn(
              'min-w-0 flex-1 text-[13px] leading-snug',
              notification.isRead
                ? 'font-medium text-ink-soft'
                : 'font-semibold text-ink',
            )}
          >
            {notification.title}
          </span>

          {notification.isRead ? null : (
            <span
              aria-label="Unread"
              className="mt-1.5 size-2 shrink-0 rounded-full bg-brand"
            />
          )}
        </span>

        <span className="mt-1 line-clamp-2 block text-[13px] leading-relaxed text-muted-foreground">
          {notification.message}
        </span>

        <span className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
          {relativeTime(notification.updatedAt ?? notification.createdAt)}
          {href ? (
            <span className="inline-flex items-center gap-0.5 font-semibold text-brand">
              Open
              <Icon name="chevronRight" size={13} />
            </span>
          ) : null}
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={read}
        className={cn(row, 'hover:bg-subtle focus-visible:bg-subtle')}
      >
        {body}
      </Link>
    );
  }

  if (!notification.isRead) {
    return (
      <button
        type="button"
        onClick={read}
        title="Mark as read"
        className={cn(row, 'hover:bg-subtle focus-visible:bg-subtle')}
      >
        {body}
      </button>
    );
  }

  return <div className={row}>{body}</div>;
};
