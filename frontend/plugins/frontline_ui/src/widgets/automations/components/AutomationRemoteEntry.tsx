import { Button, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

const FacebookRemoteEntry = lazy(() =>
  import('../modules/facebook/components/FacebookRemoteEntry').then(
    (module) => ({
      default: module.FacebookRemoteEntry,
    }),
  ),
);

const Remotes: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<any>>
> = {
  facebook: FacebookRemoteEntry,
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

const AutomationRemoteEntries = ({ moduleName, ...props }: any) => {
  const RemoteComponent = Remotes[moduleName];

  return (
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary FallbackComponent={GenericErrorFallback}>
        <RemoteComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default AutomationRemoteEntries;
