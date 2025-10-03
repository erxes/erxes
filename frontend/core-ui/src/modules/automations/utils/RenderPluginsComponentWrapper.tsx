import { ErrorState } from '@/automations/utils/ErrorState';
import { IconInfoTriangle } from '@tabler/icons-react';
import { isEnabled, Spinner } from 'erxes-ui';
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

  if (!isEnabled(pluginName)) {
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
