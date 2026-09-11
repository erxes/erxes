import { Button, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { NotificationContent } from './system/NotficationContent';
import { TicketDetailSheet } from '@/ticket/components/ticket-detail/TicketDetailSheet';
import { TicketDetails } from '../../modules/ticket/components/ticket-detail/TicketDetails';
import { IconInfoCircle } from '@tabler/icons-react';
import { TNotification } from 'ui-modules';
const NotificationConversationDetail = lazy(() =>
  import('./my-inbox/components/NotificationConversationDetail').then(
    (module) => ({
      default: module.NotificationConversationDetail,
    }),
  ),
);

const NotificationChannelContent = lazy(() =>
  import('./my-inbox/components/NotificationChannelContent').then((module) => ({
    default: module.NotificationChannelContent,
  })),
);
type GenericErrorFallbackProps = FallbackProps & {
  title?: string;
};
export const GenericErrorFallback = ({
  resetErrorBoundary,
  error,
  title,
}: GenericErrorFallbackProps) => {
  const { t } = useTranslation('frontline');
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="rounded-lg bg-background p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-foreground">
          {title ??
            t('sorry-something-went-wrong', 'Sorry, something went wrong')}
        </h1>
        <p className="mb-6 text-accent-foreground">{error?.message}</p>
        <Button onClick={resetErrorBoundary} variant="secondary">
          {t('try-again', 'Try Again')}
        </Button>
      </div>
    </div>
  );
};

const NotificationRemoteEntries = (props: TNotification) => {
  const { t } = useTranslation('frontline');
  const { contentTypeId, contentType } = props;
  const [, moduleName, type] = (contentType || '').replace(':', '.').split('.');

  const isFacebookBotHealthNotification =
    moduleName === 'facebook' && type === 'bot_health';

  if (isFacebookBotHealthNotification) {
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-4">
            {t('loading', 'Loading...')}
          </div>
        }
      >
        <NotificationContent.facebookBotHealth {...props} />
      </Suspense>
    );
  }

  if (moduleName === 'system' && type) {
    const NotificationComponent =
      NotificationContent[type as keyof typeof NotificationContent];

    if (!NotificationComponent) {
      return (
        <div>
          {t('no-notification-component', 'No notification component found')}
        </div>
      );
    }

    return <NotificationComponent {...props} />;
  }

  if (!contentTypeId) {
    return <NotificationContentUnavailable />;
  }

  if (moduleName === 'inbox') {
    if (type === 'channel') {
      return (
        <Suspense fallback={<Spinner containerClassName="h-full" />}>
          <NotificationChannelContent {...props} />
        </Suspense>
      );
    }

    return (
      <div className="h-screen flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <Suspense fallback={<Spinner containerClassName="h-full" />}>
            <NotificationConversationDetail contentTypeId={contentTypeId} />
          </Suspense>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full overflow-auto">
      <TicketDetailSheet />
      <div className="mx-auto w-full max-w-3xl p-6">
        <TicketDetails ticketId={contentTypeId} />
      </div>
    </div>
  );
};

const NotificationContentUnavailable = () => {
  const { t } = useTranslation('frontline');
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
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

export default NotificationRemoteEntries;
