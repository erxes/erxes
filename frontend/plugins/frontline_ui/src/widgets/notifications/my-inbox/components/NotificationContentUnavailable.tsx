import { useTranslation } from 'react-i18next';
import { IconInfoCircle } from '@tabler/icons-react';

export const NotificationContentUnavailable = () => {
  const { t } = useTranslation('frontline');

  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-accent text-muted-foreground">
          <IconInfoCircle className="size-5" />
        </div>
        <h3 className="text-base font-medium text-foreground">
          {t(
            'notification-content-unavailable',
            'Notification content unavailable',
          )}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(
            'notification-no-detail-view',
            'This notification does not have a linked detail view yet.',
          )}
        </p>
      </div>
    </div>
  );
};
