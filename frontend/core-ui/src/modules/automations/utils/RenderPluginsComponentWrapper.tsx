import { ErrorState } from '@/automations/utils/ErrorState';
import { useAutomationsRemoteModules } from '@/automations/utils/useAutomationsModules';
import { IconInfoTriangle } from '@tabler/icons-react';
import { Spinner } from 'erxes-ui';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { AutomationRemoteEntryProps } from 'ui-modules';
import { RenderPluginsComponent } from '~/plugins/components/RenderPluginsComponent';

type Props = {
  pluginName: string;
  moduleName: string;
  props: AutomationRemoteEntryProps;
};

export const RenderPluginsComponentWrapper = ({
  pluginName,
  moduleName,
  props,
}: Props) => {
  if (!pluginName || !moduleName) {
    return null;
  }
  const { isEnabled } = useAutomationsRemoteModules(pluginName);

  if (!isEnabled) {
    return (
      <p className="flex flex-row gap-2 items-center ml-4">
        {`Plugin ${pluginName} disabled`}
        <IconInfoTriangle className="size-3 text-destructive" />
      </p>
    );
  }

  return (
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary
        FallbackComponent={({ resetErrorBoundary }) => (
          <ErrorState onRetry={resetErrorBoundary} />
        )}
      >
        <RenderPluginsComponent
          pluginName={`${pluginName}_ui`}
          remoteModuleName="automationsWidget"
          moduleName={moduleName}
          props={props}
        />
      </ErrorBoundary>
    </Suspense>
  );
};
