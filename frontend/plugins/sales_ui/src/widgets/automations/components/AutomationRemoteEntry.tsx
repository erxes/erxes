import { Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

const SalesRemoteEntry = lazy(() =>
  import('../modules/sales/components/SalesRemoteEntry').then((module) => ({
    default: module.SalesRemoteEntry,
  })),
);

const Remotes: Record<
  string,
  React.LazyExoticComponent<React.ComponentType<any>>
> = {
  sales: SalesRemoteEntry,
};

const AutomationRemoteEntries = ({ moduleName, ...props }: any) => {
  const RemoteComponent = Remotes[moduleName];

  return (
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary FallbackComponent={() => <div>Error</div>}>
        <RemoteComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default AutomationRemoteEntries;
