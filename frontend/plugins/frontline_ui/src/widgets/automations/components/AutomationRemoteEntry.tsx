import { Button, Spinner } from 'erxes-ui';
import {
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
} from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import type { AutomationRemoteEntryProps } from 'ui-modules';

const FacebookRemoteEntry = lazy(() =>
  import('../modules/facebook/components/FacebookRemoteEntry').then(
    (module) => ({
      default: module.FacebookRemoteEntry,
    }),
  ),
);

const InstagramRemoteEntry = lazy(() =>
  import('../modules/instagram/components/InstagramRemoteEntry').then(
    (module) => ({
      default: module.InstagramRemoteEntry,
    }),
  ),
);

const TicketRemoteEntry = lazy(() =>
  import('../modules/ticket/components/TicketRemoteEntry').then((module) => ({
    default: module.TicketRemoteEntry,
  })),
);

const InboxRemoteEntry = lazy(() =>
  import('../modules/inbox/components/InboxRemoteEntry').then((module) => ({
    default: module.InboxRemoteEntry,
  })),
);

const Remotes: Record<
  string,
  LazyExoticComponent<ComponentType<AutomationRemoteEntryProps>>
> = {
  facebook: FacebookRemoteEntry,
  instagram: InstagramRemoteEntry,
  tickets: TicketRemoteEntry,
  inbox: InboxRemoteEntry,
};

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

type AutomationRemoteEntriesProps = AutomationRemoteEntryProps & {
  moduleName: string;
};

export const AutomationRemoteEntries = ({
  moduleName,
  ...props
}: AutomationRemoteEntriesProps) => {
  const RemoteComponent = Remotes[moduleName];

  if (!RemoteComponent) {
    return null;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary FallbackComponent={GenericErrorFallback}>
        <RemoteComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default AutomationRemoteEntries;
