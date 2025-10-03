import { Button, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { NotificationContent } from './system/NotficationContent';
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

const Remotes: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<any>>
> = {
  conversation: ConversationDetailRemoteEntry,
  channel: NotificationChannelContent,
};

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

const NotificationRemoteEntries = ({ contentType, ...props }: any) => {
  const [_, moduleName, type] = (contentType || '')
    .replace(':', '.')
    .split('.');
  const RemoteComponent = Remotes[type];

  if (moduleName === 'system' && type) {
    const NotificationComponent =
      NotificationContent[type as keyof typeof NotificationContent];

    if (!NotificationComponent) {
      return <></>;
    }

    return <NotificationComponent {...props} />;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary FallbackComponent={GenericErrorFallback}>
        <RemoteComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default NotificationRemoteEntries;
