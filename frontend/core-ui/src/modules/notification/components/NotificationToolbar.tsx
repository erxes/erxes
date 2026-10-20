import { IconArrowDown, IconArrowUp, IconCheck } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useNotificationContext } from '@/notification/context/NotificationContext';

export const NotificationToolbar = () => {
  const {
    notification,
    loading,
    previousNotification,
    nextNotification,
    navigateToNotification,
    dismissNotification,
    dismissing,
  } = useNotificationContext();
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  return (
    <div className="box-content flex h-10 shrink-0 items-center gap-1 border-b px-3">
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('previous-notification', 'Previous notification')}
        title={`${t('previous-notification', 'Previous notification')} (↑ / K)`}
        disabled={!previousNotification || dismissing}
        onClick={() => {
          if (previousNotification)
            navigateToNotification(previousNotification);
        }}
      >
        <IconArrowUp />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={t('next-notification', 'Next notification')}
        title={`${t('next-notification', 'Next notification')} (↓ / J)`}
        disabled={!nextNotification || dismissing}
        onClick={() => {
          if (nextNotification) navigateToNotification(nextNotification);
        }}
      >
        <IconArrowDown />
      </Button>
      <Button
        variant="ghost"
        className="ml-auto"
        title="Ctrl/Cmd + Backspace / Delete"
        disabled={!notification || loading || dismissing}
        onClick={() => {
          void dismissNotification();
        }}
      >
        <IconCheck />
        {t('mark-as-read-and-next', 'Mark as read & next')}
      </Button>
    </div>
  );
};
