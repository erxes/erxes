import { NoNotificationSelected } from '@/notification/components/NoNotificationSelected';
import { NotificationContentWrapper } from '@/notification/components/NotificationContentWrapper';
import { useNotificationContext } from '@/notification/context/NotificationContext';
import { ScrollArea, Spinner } from 'erxes-ui';
import * as Sentry from '@sentry/react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export const NotificationDetail = () => {
  const { notification, loading, error } = useNotificationContext();
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  useEffect(() => {
    if (error) Sentry.captureException(error);
  }, [error]);

  let content = <NoNotificationSelected />;

  if (loading) {
    content = <Spinner />;
  } else if (error) {
    content = (
      <div
        role="alert"
        className="flex h-full items-center justify-center p-6 text-sm text-destructive"
      >
        {t('failed-to-load', { contentType: 'notification' })}
      </div>
    );
  } else if (notification) {
    content = (
      <ScrollArea
        className="h-full overflow-hidden"
        viewportClassName="[&>div]:!block [&>div]:h-full"
      >
        <NotificationContentWrapper
          key={notification.contentType?.split(/[:.]/)[0]}
        />
      </ScrollArea>
    );
  }

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">{content}</div>
  );
};
