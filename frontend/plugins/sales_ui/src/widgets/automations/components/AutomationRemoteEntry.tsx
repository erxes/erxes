import { Spinner } from 'erxes-ui';
import { ComponentType, lazy, Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AutomationRemoteEntryProps } from 'ui-modules';
import { useTranslation } from 'react-i18next';

const SalesRemoteEntry = lazy(() =>
  import('../modules/sales/components/SalesRemoteEntry').then((module) => ({
    default: module.SalesRemoteEntry,
  })),
);

const PosRemoteEntry = lazy(() =>
  import('../modules/pos/components/PosRemoteEntry').then((module) => ({
    default: module.PosRemoteEntry,
  })),
);

const Remotes: Record<
  string,
  React.LazyExoticComponent<ComponentType<AutomationRemoteEntryProps>>
> = {
  sales: SalesRemoteEntry,
  pos: PosRemoteEntry,
};

const AutomationRemoteEntries = ({
  moduleName,
  ...props
}: AutomationRemoteEntryProps & { moduleName: string }) => {
  const RemoteComponent = Remotes[moduleName];

  return (
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary FallbackComponent={() => <div>Error </div>}>
        <RemoteComponent {...props} />
      </ErrorBoundary>
    </Suspense>
  );
};

export default AutomationRemoteEntries;
