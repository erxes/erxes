import { Fragment, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { IconChevronDown } from '@tabler/icons-react';
import { Button, cn, Collapsible, RelativeDateDisplay } from 'erxes-ui';
import type { TNotification } from 'ui-modules';
import type { UseNotificationListActionsResult } from '@/notification/types/myInbox';
import { NotificationAvatar } from '@/notification/components/NotificationAvatar';
import { NotificationItem } from '@/notification/components/NotificationItem';
import { groupNotificationsByAuthor } from '@/notification/utils/groupNotificationsByAuthor';

interface NotificationFeedProps {
  groups: [string, TNotification[]][];
  selectedIds?: string[];
  focusedId?: string | null;
  onOpen: UseNotificationListActionsResult['onOpen'];
}

interface NotificationAuthorGroupProps
  extends Omit<NotificationFeedProps, 'groups'> {
  items: TNotification[];
}

const NotificationAuthorGroup = ({
  items,
  selectedIds = [],
  focusedId,
  onOpen,
}: NotificationAuthorGroupProps) => {
  const { id } = useParams();
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const [expanded, setExpanded] = useState(false);
  const focused = items.some(
    (item) => item._id === id || item._id === focusedId,
  );
  useEffect(() => {
    if (focused) setExpanded(true);
  }, [focused]);
  const first = items[0];
  const sender = first.fromUser?.details?.fullName || first.fromUser?.email;

  return (
    <Collapsible open={expanded} onOpenChange={setExpanded}>
      <Collapsible.Trigger asChild>
        <Button
          variant="ghost"
          className="h-auto w-full justify-start gap-2 rounded-lg p-2 text-left"
        >
          <NotificationAvatar
            fromUser={first.fromUser}
            isRead={first.isRead}
            count={items.length}
          />
          <span className="min-w-0 flex-1 space-y-1">
            <span
              className={cn(
                'block truncate',
                first.isRead ? 'text-muted-foreground' : 'font-semibold',
              )}
            >
              {sender}
            </span>
            <span className="block text-xs text-muted-foreground">
              {t('notification-count', {
                defaultValue: '{{count}} notifications',
                count: items.length,
              })}
              {' · '}
              <RelativeDateDisplay.Value value={first.createdAt} />
            </span>
          </span>
          <IconChevronDown
            className={cn(
              'size-4 shrink-0 text-muted-foreground transition-transform',
              expanded && 'rotate-180',
            )}
          />
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <div className="ml-6 flex flex-col gap-1 border-l pl-2">
          {items.map((item) => (
            <NotificationItem
              key={item._id}
              {...item}
              selected={selectedIds.includes(item._id)}
              selectionFocused={focusedId === item._id}
              onOpen={(event) => onOpen(item._id, event)}
            />
          ))}
        </div>
      </Collapsible.Content>
    </Collapsible>
  );
};

/** Author counts grow as additional notification pages are loaded. */
export const NotificationFeed = ({
  groups,
  selectedIds = [],
  focusedId,
  onOpen,
}: NotificationFeedProps) => {
  return (
    <div className="flex flex-col gap-3">
      {groups.map(([label, items], index) => (
        <Fragment key={`${label}:${index}`}>
          {label && (
            <h4 className="px-2 pt-2 text-xs text-muted-foreground capitalize">
              {label}
            </h4>
          )}
          {groupNotificationsByAuthor(items).map(
            ({ key, items: authorItems }) =>
              authorItems.length > 1 ? (
                <NotificationAuthorGroup
                  key={key}
                  items={authorItems}
                  selectedIds={selectedIds}
                  focusedId={focusedId}
                  onOpen={onOpen}
                />
              ) : (
                <NotificationItem
                  key={key}
                  {...authorItems[0]}
                  selected={selectedIds.includes(authorItems[0]._id)}
                  selectionFocused={focusedId === authorItems[0]._id}
                  onOpen={(event) => onOpen(authorItems[0]._id, event)}
                />
              ),
          )}
        </Fragment>
      ))}
    </div>
  );
};
