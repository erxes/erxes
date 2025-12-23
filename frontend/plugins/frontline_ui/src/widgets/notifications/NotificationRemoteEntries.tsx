import { Button } from 'erxes-ui';
import { lazy } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { NotificationContent } from './system/NotficationContent';
import { TicketDetailSheet } from '@/ticket/components/ticket-detail/TicketDetailSheet';
import { TicketDetails } from '../../modules/ticket/components/ticket-detail/TicketDetails';
import { NotificationConversationDetail } from './my-inbox/components/NotificationConversationDetail';
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
  title = 'Sorry, something went wrong',
}: GenericErrorFallbackProps) => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <div className="rounded-lg bg-background p-8 shadow-lg">
        <h1 className="mb-4 text-2xl font-bold text-foreground">{title}</h1>
        <p className="mb-6 text-accent-foreground">{error?.message}</p>
        <Button onClick={resetErrorBoundary} variant="secondary">
          Try Again
        </Button>
      </div>
    </div>
  );
};

const NotificationRemoteEntries = (props: any) => {
  const { contentTypeId, contentType } = props;
  const [_, moduleName, type] = (contentType || '')
    .replace(':', '.')
    .split('.');
  if (moduleName === 'system' && type) {
    const NotificationComponent =
      NotificationContent[type as keyof typeof NotificationContent];

    if (!NotificationComponent) {
      return <div>No notification component found</div>;
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
  return (
    <div>
      <TicketDetailSheet />
      <TicketDetails ticketId={contentTypeId} />
    </div>
  );
};

export default NotificationRemoteEntries;
