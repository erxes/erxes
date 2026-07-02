import { AutomationErrorState } from '@/automations/components/common/AutomationErrorState';
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
  if (!pluginName || pluginName === 'core' || !moduleName) {
    return null;
  }

  const { isEnabled } = useAutomationsRemoteModules(pluginName);

  // Dashed plugin names map to underscore MF container names (see
  // useAutomationsRemoteModules / core-api get-frontend-plugins `remoteName()`),
  // so the remote is "erxes_agent_ui", never "erxes-agent_ui".
  const remoteContainerName = `${pluginName.replace(/-/g, '_')}_ui`;

  if (!isEnabled) {
    return (
      <p className="flex flex-row gap-2 items-center size-full justify-center">
        {`Plugin ${pluginName} disabled`}
        <IconInfoTriangle className="size-3 text-destructive" />
      </p>
    );
  }

  return (
    <Suspense fallback={<Spinner />}>
      <ErrorBoundary
        FallbackComponent={({ resetErrorBoundary }) => (
          <AutomationErrorState onRetry={resetErrorBoundary} />
        )}
      >
        <RenderPluginsComponent
          pluginName={remoteContainerName}
          remoteModuleName="automationsWidget"
          props={{
            ...props,
            moduleName,
          }}
        />
      </ErrorBoundary>
    </Suspense>
  );
};
