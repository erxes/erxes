import { Button } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { NotificationContent } from './system/NotficationContent';
import { TicketDetailSheet } from '@/ticket/components/ticket-detail/TicketDetailSheet';
import { TicketDetails } from '../../modules/ticket/components/ticket-detail/TicketDetails';
import { NotificationConversationDetail } from './my-inbox/components/NotificationConversationDetail';
import { IconInfoCircle } from '@tabler/icons-react';
import { TNotification } from 'ui-modules';
const ConversationDetailRemoteEntry = lazy(() =>
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
        <h1 className="mb-4 text-2xl font-bold text-foreground">{title ?? t('sorry-something-went-wrong')}</h1>
        <p className="mb-6 text-accent-foreground">{error?.message}</p>
        <Button onClick={resetErrorBoundary} variant="secondary">
          {t('try-again')}
        </Button>
      </div>
    </div>
  );
};

const NotificationRemoteEntries = (props: TNotification) => {
  const { t } = useTranslation('frontline');
  const { contentTypeId, contentType } = props;
  const [_, moduleName, type] = (contentType || '')
    .replace(':', '.')
    .split('.');

  const isFacebookBotHealthNotification =
    moduleName === 'facebook' && type === 'bot_health';

  if (isFacebookBotHealthNotification) {
    return (
      <Suspense
        fallback={
          <div className="flex items-center justify-center p-4">{t('loading')}</div>
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
      return <div>{t('no-notification-component')}</div>;
    }

    return <NotificationComponent {...props} />;
  }
  if (moduleName === 'inbox') {
    return (
      <div className="h-screen flex flex-col">
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <NotificationConversationDetail contentTypeId={contentTypeId} />
        </div>
      </div>
    );
  }

  if (!contentTypeId) {
    return <NotificationContentUnavailable />;
  }

  return (
    <div>
      <TicketDetailSheet />
      <TicketDetails ticketId={contentTypeId} />
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
          {t('notification-content-unavailable')}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('notification-no-detail-view')}
        </p>
      </div>
    </div>
  );
};

export default NotificationRemoteEntries;
