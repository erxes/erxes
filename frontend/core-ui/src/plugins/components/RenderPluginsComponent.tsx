import React, { useEffect, useState, Suspense } from 'react';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { Spinner } from 'erxes-ui';

interface RemoteComponentProps {
  module?: string;
}

export function RenderPluginsComponent({
  pluginName,
  remoteModuleName,
  moduleName,
  props,
}: {
  pluginName: string;
  remoteModuleName: string;
  moduleName: string;
  props?: any;
}) {
  const [Plugin, setPlugin] =
    useState<React.ComponentType<RemoteComponentProps> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState<{ message: string } | null>(null);

  useEffect(() => {
    const loadPlugin = async () => {
      try {
        setIsLoading(true);
        setHasError(null);

        const remoteModule = await loadRemote<{
          default: React.ComponentType<RemoteComponentProps>;
        }>(`${pluginName}/${remoteModuleName}`, { from: 'runtime' });

        if (!remoteModule?.default) {
          throw new Error('Plugin module is empty or invalid');
        }

        setPlugin(() => remoteModule.default);
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
      <div className="flex items-center justify-center h-full text-red-500">
        {hasError.message}
      </div>
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
      <Plugin
        key={`${pluginName}-${remoteModuleName}`}
        {...props}
        moduleName={moduleName}
      />
    </Suspense>
  );
}
