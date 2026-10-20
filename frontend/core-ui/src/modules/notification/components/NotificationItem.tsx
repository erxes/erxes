import { NotificationIcon } from '@/notification/components/NotificationIcon';
import type { NotificationItemProps } from '@/notification/types/myInbox';
import { Badge, Button, cn, RelativeDateDisplay } from 'erxes-ui';
import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { inboxDisplayOptionsState } from '@/notification/states/notificationState';

export const NotificationItem = ({
  _id,
  createdAt = '',
  message,
  title,
  fromUser,
  isRead,
  contentType = '',
  priority,
  selected,
  selectionFocused,
  onOpen,
}: NotificationItemProps) => {
  const { id } = useParams();
  const display = useAtomValue(inboxDisplayOptionsState);
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const sender =
    fromUser?.details?.fullName || fromUser?.email || t('system', 'System');
  const isActive = id === _id;
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (isActive || selectionFocused) {
      linkRef.current?.scrollIntoView({ block: 'nearest' });
    }
  }, [isActive, selectionFocused]);

  return (
    <Button
      asChild
      variant="ghost"
      className={cn(
        'justify-start h-auto rounded-lg p-2 items-start overflow-hidden relative select-none',
        (isActive || selected) && 'bg-primary/10 hover:bg-primary/10',
        selectionFocused && 'ring-1 ring-inset ring-primary/30',
      )}
    >
      <Link
        ref={linkRef}
        title={message || title}
        aria-current={isActive ? 'page' : undefined}
        onClick={onOpen}
        onMouseDown={(event) => {
          if (event.shiftKey) event.preventDefault();
        }}
        to={`/my-inbox/${_id}${window.location.search}`}
      >
        <div
          className={cn(
            'size-8 bg-foreground/5 rounded-full flex-none flex items-center justify-center relative',
            isActive && 'text-primary',
          )}
        >
          <NotificationIcon contentType={contentType} />
          {!isRead && (
            <div className="size-1.5 absolute bg-destructive rounded-full top-1.5 right-1.5" />
          )}
        </div>
        <div className="flex-auto space-y-1 overflow-hidden">
          {display.showSender && (
            <div className="truncate text-xs text-muted-foreground">
              {sender}
            </div>
          )}
          <div className="flex items-center justify-between">
            <h4
              className={cn(
                'line-clamp-1 truncate',
                isRead ? 'text-muted-foreground' : 'font-semibold',
                isActive && 'text-foreground',
              )}
            >
              {message}
            </h4>
          </div>
          <div className={cn('text-xs flex items-center justify-between')}>
            <div className="flex items-center gap-2">
              {display.showPriority && (
                <Badge className="capitalize" variant="secondary">
                  {priority}
                </Badge>
              )}
            </div>

            <div
              className={cn(isRead ? 'text-muted-foreground' : 'font-semibold')}
            >
              <RelativeDateDisplay.Value value={createdAt} />
            </div>
          </div>
        </div>
      </Link>
    </Button>
  );
};
