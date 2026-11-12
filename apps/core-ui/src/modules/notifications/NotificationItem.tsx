import type { ContentType, Notification } from '@erxes/core-contract';
import { IconCheck, IconChevronDown, IconExternalLink, IconTrash } from '@tabler/icons-react';
import { Badge, Button, cn, RelativeDateDisplay } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { ChangeList, useChangeLookups } from '~/components/ChangeList';
import { UserAvatar } from '~/components/UserAvatar';
import { type Inbox, useNotificationActions } from './useNotifications';

/** Core's `*.updated` kinds carry `{ changes: { field: [before, after] } }`. */
const Changes = z.record(z.tuple([z.unknown(), z.unknown()]));

type Changes = z.infer<typeof Changes>;

/** Core's own kinds have translated titles; plugins send theirs ready to read. */
const useNotificationTitle = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications.kinds' });

  return (notification: Notification) =>
    notification.source === 'core' ? t(notification.kind, notification.title) : notification.title;
};

const changesOf = (notification: Notification) => {
  const changes = Changes.safeParse(notification.data.changes);

  return changes.success && Object.keys(changes.data).length ? changes.data : null;
};

/** What changed, with names for owners, tags and properties of the record. */
const NotificationChanges = ({
  notification,
  changes,
}: {
  notification: Notification;
  changes: Changes;
}) => {
  const contentType: ContentType = notification.entity?.type === 'company' ? 'company' : 'customer';
  const lookups = useChangeLookups(contentType, [changes]);

  return <ChangeList changes={changes} lookups={lookups} />;
};

/** Sender, time, inbox, priority and the changes toggle under the title. */
const NotificationMeta = ({
  notification,
  sender,
  inbox,
  changeCount,
  expanded,
  onToggle,
}: {
  notification: Notification;
  sender: string;
  inbox?: Inbox;
  /** Shown as a toggle when the notification lists changes. */
  changeCount: number;
  expanded: boolean;
  onToggle: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });

  return (
    <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
      {notification.actor.type === 'user' && (
        <>
          <span className="truncate">{sender}</span>
          <span aria-hidden="true">·</span>
        </>
      )}
      <RelativeDateDisplay value={notification.createdAt} asChild>
        <span>
          <RelativeDateDisplay.Value value={notification.createdAt} />
        </span>
      </RelativeDateDisplay>
      {inbox && notification.source !== 'core' && (
        <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">
          {inbox.label}
        </Badge>
      )}
      {notification.priority === 'high' && (
        <Badge variant="destructive" className="h-4 px-1.5 text-[10px]">
          {t('important', 'Important')}
        </Badge>
      )}
      {changeCount > 0 && (
        <button
          type="button"
          className="relative inline-flex items-center gap-0.5 text-primary hover:underline"
          onClick={onToggle}
        >
          {t('changes', { count: changeCount, defaultValue: `${changeCount} changes` })}
          <IconChevronDown
            className={cn('size-3 transition-transform', expanded && 'rotate-180')}
          />
        </button>
      )}
    </div>
  );
};

/** Open, mark read or unread, and remove: shown on hover. */
const NotificationActions = ({
  notification,
  onOpen,
}: {
  notification: Notification;
  /** Omitted when the notification has nowhere to open. */
  onOpen?: () => void;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });
  const { markRead, remove } = useNotificationActions();

  return (
    <div className="absolute top-2 right-2 hidden gap-0.5 rounded-md bg-accent group-hover:flex">
      {onOpen && (
        <Button
          size="icon"
          variant="ghost"
          className="size-6"
          aria-label={t('open', 'Open')}
          onClick={onOpen}
        >
          <IconExternalLink className="size-3.5" />
        </Button>
      )}
      <Button
        size="icon"
        variant="ghost"
        className="size-6"
        aria-label={
          notification.read ? t('mark-unread', 'Mark as unread') : t('mark-read', 'Mark as read')
        }
        onClick={() => markRead.mutate({ ids: [notification.id], read: !notification.read })}
      >
        <IconCheck className={cn('size-3.5', notification.read && 'text-primary')} />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="size-6"
        aria-label={t('remove', 'Remove')}
        onClick={() => remove.mutate({ id: notification.id })}
      >
        <IconTrash className="size-3.5" />
      </Button>
    </div>
  );
};

/** Who sent it, badged with the inbox it came to. */
const SenderAvatar = ({
  sender,
  src,
  inbox,
}: {
  sender: string;
  src?: string | null;
  inbox?: Inbox;
}) => {
  const InboxIcon = inbox?.icon;

  return (
    <span className="relative mt-0.5 shrink-0">
      <UserAvatar name={sender} src={src} className="size-7" />
      {InboxIcon && (
        <span className="absolute -right-1 -bottom-1 flex size-4 items-center justify-center rounded-full border bg-background text-primary [&>svg]:size-2.5">
          <InboxIcon className="size-2.5" />
        </span>
      )}
    </span>
  );
};

/** The title, as the button that opens the notification, and the unread dot. */
const NotificationTitle = ({
  notification,
  onOpen,
}: {
  notification: Notification;
  onOpen: () => void;
}) => {
  const title = useNotificationTitle();
  const { t } = useTranslation('common', { keyPrefix: 'notifications' });

  return (
    <div className="flex items-start gap-2">
      {/* The whole row opens it: the button's ::after covers the row. */}
      <button
        type="button"
        onClick={onOpen}
        className={cn(
          'flex-1 text-left text-sm leading-5 after:absolute after:inset-0',
          !notification.read && 'font-medium',
        )}
      >
        {title(notification)}
      </button>
      {!notification.read && (
        <span
          className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
          aria-label={t('unread', 'Unread')}
        />
      )}
    </div>
  );
};

export const NotificationItem = ({
  notification,
  sender,
  senderAvatar,
  inbox,
  onOpen,
  compact,
}: {
  notification: Notification;
  sender: string;
  senderAvatar?: string | null;
  inbox?: Inbox;
  onOpen?: () => void;
  compact?: boolean;
}) => {
  const navigate = useNavigate();
  const { markRead } = useNotificationActions();
  const [expanded, setExpanded] = useState(false);
  const listedChanges = changesOf(notification);
  // A compact list has no room for changes.
  const changes = compact ? null : listedChanges;

  const open = () => {
    if (!notification.read) markRead.mutate({ ids: [notification.id] });

    if (notification.link) {
      void navigate(notification.link);
      onOpen?.();
    } else if (changes) {
      setExpanded((value) => !value);
    }
  };

  return (
    <li
      className={cn(
        'group relative flex gap-3 rounded-md px-3 py-2.5 hover:bg-accent',
        (notification.link || listedChanges) && 'cursor-pointer',
        !notification.read && 'bg-primary/5',
      )}
    >
      <SenderAvatar sender={sender} src={senderAvatar} inbox={inbox} />
      <div className="min-w-0 flex-1">
        <NotificationTitle notification={notification} onOpen={open} />
        {notification.body && (
          <p
            className={cn(
              'text-sm text-muted-foreground',
              compact ? 'line-clamp-2' : 'whitespace-pre-line',
            )}
          >
            {notification.body}
          </p>
        )}
        {changes && expanded && (
          <NotificationChanges notification={notification} changes={changes} />
        )}
        <NotificationMeta
          notification={notification}
          sender={sender}
          inbox={inbox}
          changeCount={changes ? Object.keys(changes).length : 0}
          expanded={expanded}
          onToggle={() => setExpanded((value) => !value)}
        />
      </div>
      <NotificationActions
        notification={notification}
        onOpen={notification.link && !compact ? open : undefined}
      />
    </li>
  );
};
