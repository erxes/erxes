import { loadRemote } from '@module-federation/enhanced/runtime';
import { Spinner } from 'erxes-ui';
import { Suspense, useEffect, useState } from 'react';
import {
  RemoteComponent,
  RemoteComponentProps,
  RemoteModule,
  resolveRemoteComponent,
} from '../utils/resolveRemoteComponent';
import { RenderPluginsComponentErrorState } from './RenderPluginsComponentErrorState';
import { RenderPluginsComponentCrashState } from './RenderPluginsComponentCrashState';
import { ErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/react';

export function RenderPluginsComponent({
  pluginName,
  remoteModuleName,
  props,
  withMascot,
}: {
  pluginName: string;
  remoteModuleName: string;
  props?: RemoteComponentProps;
  withMascot?: boolean;
}) {
  const [Plugin, setPlugin] = useState<RemoteComponent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState<{ message: string } | null>(null);

  useEffect(() => {
    const loadPlugin = async () => {
      try {
        setIsLoading(true);
        setHasError(null);

        const remoteModule = await loadRemote<RemoteModule>(
          `${pluginName}/${remoteModuleName}`,
          { from: 'runtime' },
        );
        const remoteComponent = resolveRemoteComponent(
          remoteModule,
          remoteModuleName,
        );

        if (!remoteComponent) {
          throw new Error('Plugin module is empty or invalid');
        }

        setPlugin(() => remoteComponent);
      } catch (error) {
        setHasError({
          message:
            error instanceof Error ? error.message : 'Failed to load plugin',
        });
        setPlugin(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlugin();
  }, [pluginName, remoteModuleName]);

  if (hasError) {
    return (
      <RenderPluginsComponentErrorState
        pluginName={pluginName}
        remoteModuleName={remoteModuleName}
        setPlugin={setPlugin}
        setHasError={setHasError}
        setIsLoading={setIsLoading}
      />
    );
  }

  const loader = (
    <div className="flex justify-center items-center h-full">
      <Spinner withMascot={withMascot} />
    </div>
  );

  if (isLoading || !Plugin) {
    return loader;
  }

  return (
    <Suspense fallback={loader}>
      {/* One plugin breaking while drawing must not take its host down. */}
      <ErrorBoundary
        FallbackComponent={RenderPluginsComponentCrashState}
        resetKeys={[pluginName, remoteModuleName]}
        onError={(error, info) =>
          Sentry.captureException(error, {
            extra: {
              pluginName,
              remoteModuleName,
              componentStack: info.componentStack,
            },
          })
        }
      >
        <Plugin key={`${pluginName}-${remoteModuleName}`} {...(props || {})} />
      </ErrorBoundary>
    </Suspense>
  );
}
