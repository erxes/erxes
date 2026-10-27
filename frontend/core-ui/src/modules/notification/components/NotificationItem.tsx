import { NotificationIcon } from '@/notification/components/NotificationIcon';
import { NotificationPriority } from '@/notification/components/NotificationPriority';
import { NotificationSenderAvatar } from '@/notification/components/NotificationSenderAvatar';
import { NotificationQuickRead } from '@/notification/components/NotificationQuickRead';
import {
  NOTIFICATION_PRIORITY_VARIANTS,
  NOTIFICATION_APP_COLORS,
} from '@/notification/constants/notifications';
import type { NotificationItemProps } from '@/notification/types/myInbox';
import { useNotificationItemScroll } from '@/notification/hooks/useNotificationItemScroll';
import { Badge, Button, Checkbox, cn, RelativeDateDisplay } from 'erxes-ui';
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
  type = 'info',
  selected,
  selectionDisabled = false,
  selectionFocused,
  onToggleSelection,
  onOpen,
}: NotificationItemProps) => {
  const { id } = useParams();
  const display = useAtomValue(inboxDisplayOptionsState);
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const appName = contentType.split(/[:.]/)[0] || 'core';
  const isActive = id === _id;
  const linkRef = useNotificationItemScroll({ isActive, selectionFocused });
  const avatar = (
    <div
      className={cn(
        'relative flex size-8 flex-none items-center justify-center rounded-full transition-opacity',
        NOTIFICATION_APP_COLORS[appName] || 'bg-muted text-muted-foreground',
        selected
          ? 'opacity-0'
          : onToggleSelection &&
              'group-hover/avatar:opacity-0 peer-focus-visible/selection:opacity-0',
      )}
      title={appName}
    >
      <NotificationIcon contentType={contentType} />
      <span className="sr-only">{t(type, type)}</span>
      {!isRead && (
        <>
          <span className="size-1.5 absolute bg-primary ring-2 ring-background rounded-full top-0 right-0" />
          <span className="sr-only">{t('unread', 'Unread')}</span>
        </>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        'group relative flex items-start rounded-lg border-l-2 border-transparent p-2 select-none hover:bg-accent',
        onToggleSelection && 'gap-2',
        !isRead && 'border-primary bg-background hover:bg-primary/5',
        (isActive || selected) &&
          'border-primary bg-primary/10 hover:bg-primary/15',
        selectionFocused && 'ring-1 ring-inset ring-primary/30',
      )}
    >
      {onToggleSelection && (
        <div className="group/avatar relative size-8 flex-none">
          <Checkbox
            checked={selected}
            disabled={selectionDisabled}
            className={cn(
              'peer/selection pointer-events-none absolute left-2 top-2 z-10 bg-background opacity-0 transition-opacity group-hover/avatar:pointer-events-auto group-hover/avatar:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100',
              selected && 'pointer-events-auto opacity-100',
            )}
            aria-label={t('select-notification-label', {
              title: message || title,
            })}
            onClick={(event) => {
              event.preventDefault();
              onToggleSelection(event.shiftKey);
            }}
          />
          {avatar}
        </div>
      )}
      <Button
        asChild
        variant="ghost"
        className="h-auto min-w-0 flex-1 items-start justify-start gap-2 p-0 hover:bg-transparent"
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
          {!onToggleSelection && avatar}
          <div className="flex-auto space-y-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <h4
                className={cn(
                  'text-left',
                  display.wrapMessages
                    ? 'line-clamp-2 whitespace-normal break-words'
                    : 'line-clamp-1 truncate',
                  isRead ? 'text-muted-foreground' : 'font-semibold',
                  isActive && 'text-foreground',
                )}
              >
                {message || title}
              </h4>
            </div>
            <div className="flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                {display.showPriority && (
                  <Badge
                    className="capitalize"
                    variant={NOTIFICATION_PRIORITY_VARIANTS[priority]}
                  >
                    <NotificationPriority priority={priority} />
                  </Badge>
                )}
                {display.showSender && (
                  <NotificationSenderAvatar fromUser={fromUser} />
                )}
              </div>

              <div
                className={cn(
                  'ml-auto shrink-0 whitespace-nowrap',
                  isRead ? 'text-muted-foreground' : 'font-semibold',
                  onToggleSelection &&
                    !isRead &&
                    !selected &&
                    'group-hover:opacity-0 group-focus-within:opacity-0',
                )}
              >
                <RelativeDateDisplay.Value value={createdAt} />
              </div>
            </div>
          </div>
        </Link>
      </Button>
      {onToggleSelection && !isRead && !selected && (
        <NotificationQuickRead id={_id} disabled={selectionDisabled} />
      )}
    </div>
  );
};
