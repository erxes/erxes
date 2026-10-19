import { lazy, Suspense } from 'react';
import { Spinner } from 'erxes-ui';
import { NotificationContent } from '~/widgets/notifications/contents/NotificationContent';
import { useTranslation } from 'react-i18next';
import { type TNotification } from 'ui-modules';
import { NotificationTaskDetail } from '~/widgets/notifications/my-inbox/components/NotificationTaskDetail';

const NotificationProjectDetail = lazy(() =>
  import(
    '~/widgets/notifications/my-inbox/components/NotificationProjectDetail'
  ).then((module) => ({
    default: module.NotificationProjectDetail,
  })),
);

const NotificationTeamContent = lazy(() =>
  import(
    '~/widgets/notifications/my-inbox/components/NotificationTeamContent'
  ).then((m) => ({
    default: m.NotificationTeamContent,
  })),
);

export const NotificationsWidgets = (props: TNotification) => {
  const { t } = useTranslation('operation');
  const { contentTypeId, contentType } = props;

  const [, moduleName, collectionType] = (contentType || '')
    .replace(':', '.')
    .split('.');

  if (moduleName === 'system' && collectionType) {
    const NotificationComponent =
      NotificationContent[collectionType as keyof typeof NotificationContent];

    if (!NotificationComponent) {
      return <div>{t('no-notification-component-found')}</div>;
    }

    return <NotificationComponent />;
  }

  if (!contentTypeId) {
    return (
      <div className="flex min-h-full items-center justify-center p-6">
        {t(
          'notification-content-unavailable',
          'Notification content unavailable',
        )}
      </div>
    );
  }

  if (moduleName === 'project') {
    return (
      <Suspense fallback={<Spinner containerClassName="h-full" />}>
        <NotificationProjectDetail contentTypeId={contentTypeId} />
      </Suspense>
    );
  }

  if (moduleName === 'team') {
    return (
      <Suspense fallback={<Spinner containerClassName="h-full" />}>
        <NotificationTeamContent {...props} />
      </Suspense>
    );
  }

  return <NotificationTaskDetail contentTypeId={contentTypeId} />;
};
