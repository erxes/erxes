import * as Sentry from '@sentry/react';

import {
  RemoteComponent,
  RemoteComponentProps,
} from '../utils/resolveRemoteComponent';
import {
  getLoadedRemoteComponent,
  getRemoteComponentKey,
  loadRemoteComponent,
} from '../utils/loadRemoteComponent';
import { Suspense, useEffect, useState } from 'react';

import { ErrorBoundary } from 'react-error-boundary';
import { RenderPluginsComponentCrashState } from './RenderPluginsComponentCrashState';
import { RenderPluginsComponentErrorState } from './RenderPluginsComponentErrorState';
import { Spinner } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { pluginsConfigState } from 'ui-modules';
import { resolvePluginRemoteName } from '../utils/resolvePluginRemoteName';

const QuietCrashState = () => null;

export function RenderPluginsComponent({
  pluginName: requestedPluginName,
  remoteModuleName,
  props,
  withMascot,
  quiet,
  onLoadError,
}: {
  pluginName: string;
  remoteModuleName: string;
  props?: RemoteComponentProps;
  withMascot?: boolean;
  /**
   * Render nothing while loading or after a failure, for overlays (floating
   * widgets) that must never take page space.
   */
  quiet?: boolean;
  // The remote could not be loaded or crashed, e.g. so the host can show
  // something else in its place.
  onLoadError?: () => void;
}) {
  const configs = useAtomValue(pluginsConfigState);
  const pluginName = resolvePluginRemoteName(requestedPluginName, configs);
  // A plugin loaded before renders on the first frame: switching apps must
  // not flash the loader, since the plugin draws its own sidebar.
  const [Plugin, setPlugin] = useState<RemoteComponent | null>(
    () =>
      getLoadedRemoteComponent(
        getRemoteComponentKey(pluginName, remoteModuleName),
      ) || null,
  );
  const [isLoading, setIsLoading] = useState(!Plugin);
  const [hasError, setHasError] = useState<{ message: string } | null>(null);

  useEffect(() => {
    const cached = getLoadedRemoteComponent(
      getRemoteComponentKey(pluginName, remoteModuleName),
    );

    if (cached) {
      setPlugin(() => cached);
      setIsLoading(false);
      setHasError(null);
      return;
    }

    const loadPlugin = async () => {
      try {
        setIsLoading(true);
        setHasError(null);

        const remoteComponent = await loadRemoteComponent(
          pluginName,
          remoteModuleName,
        );

        setPlugin(() => remoteComponent);
      } catch (error) {
        onLoadError?.();
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
    if (quiet) {
      return null;
    }

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

  const loader = quiet ? null : (
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
        FallbackComponent={
          quiet ? QuietCrashState : RenderPluginsComponentCrashState
        }
        resetKeys={[pluginName, remoteModuleName]}
        onError={(error, info) => {
          onLoadError?.();
          // The fallback hides the error; keep it visible for debugging.
          console.error(
            `[${pluginName}/${remoteModuleName}] render failed`,
            error,
            info.componentStack,
          );
          Sentry.captureException(error, {
            extra: {
              pluginName,
              remoteModuleName,
              componentStack: info.componentStack,
            },
          });
        }}
      >
        <Plugin key={`${pluginName}-${remoteModuleName}`} {...(props || {})} />
      </ErrorBoundary>
    </Suspense>
  );
}
