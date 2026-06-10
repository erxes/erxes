import { Button, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { ErrorBoundary, FallbackProps } from 'react-error-boundary';

const LoyaltyRemoteEntry = lazy(() =>
  import('../modules/loyalty/components/LoyaltyRemoteEntry').then((module) => ({
    default: module.LoyaltyRemoteEntry,
  })),
);

const Remotes: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<any>>
> = {
  score: LoyaltyRemoteEntry,
  voucher: LoyaltyRemoteEntry,
  spin: LoyaltyRemoteEntry,
};

const AutomationRemoteErrorFallback = ({
  resetErrorBoundary,
  error,
}: FallbackProps) => {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-3 p-4 text-center">
      <p className="text-sm font-medium">Unable to load loyalty automation</p>
      <p className="text-xs text-accent-foreground">{error?.message}</p>
      <Button size="sm" variant="secondary" onClick={resetErrorBoundary}>
        Try again
      </Button>
    </div>
  );
};

const AutomationRemoteEntries = ({ moduleName, ...props }: any) => {
  const RemoteComponent = Remotes[moduleName];

  if (!RemoteComponent) {
    return null;
  }

  return (
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary FallbackComponent={AutomationRemoteErrorFallback}>
        <RemoteComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default AutomationRemoteEntries;
