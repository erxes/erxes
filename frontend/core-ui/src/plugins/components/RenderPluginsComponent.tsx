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

export function RenderPluginsComponent({
  pluginName,
  remoteModuleName,
  props,
}: {
  pluginName: string;
  remoteModuleName: string;
  props?: RemoteComponentProps;
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

  if (isLoading || !Plugin) {
    return (
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-full">
            <Spinner />
          </div>
        }
      >
        <div />
      </Suspense>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-full">
          <Spinner />
        </div>
      }
    >
      <Plugin key={`${pluginName}-${remoteModuleName}`} {...(props || {})} />
    </Suspense>
  );
}
