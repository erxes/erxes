import { NotificationMark } from '@/notification/components/NotificationItem';
import { useInboxActions } from '@/notification/hooks/useInboxActions';
import { useNotificationApp } from '@/notification/hooks/useNotificationApp';
import { IconArchive, IconChevronLeft } from '@tabler/icons-react';
import { Button, RelativeDateDisplay, useIsMobile } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { TNotification } from 'ui-modules';

/** Who sent the open notification, when, and what you can do with it. */
export const NotificationToolbar = ({
  notification,
}: {
  notification: TNotification;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { label } = useNotificationApp(notification.contentType);
  const { archiveNotification, archiving } = useInboxActions();
  const sender = notification.fromUser?.details?.fullName;

  return (
    <div className="flex h-12 shrink-0 items-center gap-2.5 border-b px-3">
      {isMobile && (
        <Button variant="ghost" size="icon" asChild>
          <Link
            to={`/my-inbox${window.location.search}`}
            aria-label={t('back')}
          >
            <IconChevronLeft />
          </Link>
        </Button>
      )}
      <NotificationMark contentType={notification.contentType} size={24} />
      <span className="min-w-0 flex-1 truncate text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {sender && ` · ${sender}`} ·{' '}
          <RelativeDateDisplay.Value value={notification.createdAt} />
        </span>
      </span>
      <Button
        variant="ghost"
        className="text-muted-foreground"
        disabled={archiving}
        onClick={() =>
          archiveNotification(notification._id).then(() =>
            navigate(`/my-inbox${window.location.search}`),
          )
        }
      >
        <IconArchive />
        {t('archive')}
      </Button>
    </div>
  );
};
