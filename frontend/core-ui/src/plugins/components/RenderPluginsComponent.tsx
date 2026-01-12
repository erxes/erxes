import React, { useEffect, useState, Suspense } from 'react';
import { loadRemote } from '@module-federation/enhanced/runtime';
import { Spinner } from 'erxes-ui';
import { WelcomeNotificationFallback } from 'ui-modules/modules/notifications/components/WelcomeNotificationFallback';
interface RemoteComponentProps {
  module?: string;
}

export function RenderPluginsComponent({
  pluginName,
  remoteModuleName,
  props,
}: {
  pluginName: string;
  remoteModuleName: string;
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
      <WelcomeNotificationFallback pluginName={pluginName.split('_')[0]} />
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
      <Plugin key={`${pluginName}-${remoteModuleName}`} {...props} />
    </Suspense>
  );
}
