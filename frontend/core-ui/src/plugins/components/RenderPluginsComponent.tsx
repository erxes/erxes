import { Spinner } from 'erxes-ui';
import { Suspense, useEffect, useState } from 'react';
import {
  getLoadedRemoteComponent,
  getRemoteComponentKey,
  loadRemoteComponent,
} from '../utils/loadRemoteComponent';
import { RemoteComponentProps } from '../utils/resolveRemoteComponent';
import { RenderPluginsComponentErrorState } from './RenderPluginsComponentErrorState';

const SPINNER_DELAY = 200;

const PluginLoading = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), SPINNER_DELAY);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="flex h-full items-center justify-center">
      {visible && <Spinner />}
    </div>
  );
};

export function RenderPluginsComponent({
  pluginName,
  remoteModuleName,
  props,
}: {
  pluginName: string;
  remoteModuleName: string;
  props?: RemoteComponentProps;
}) {
  const key = getRemoteComponentKey(pluginName, remoteModuleName);
  const [result, setResult] = useState<{ key: string; error?: string }>();
  const [attempt, setAttempt] = useState(0);
  const Plugin = getLoadedRemoteComponent(key);
  const error = result?.key === key ? result.error : undefined;

  useEffect(() => {
    if (getLoadedRemoteComponent(key)) {
      return;
    }

    let cancelled = false;

    loadRemoteComponent(pluginName, remoteModuleName)
      .then(() => {
        if (!cancelled) {
          setResult({ key });
        }
      })
      .catch((loadError) => {
        if (!cancelled) {
          setResult({
            key,
            error:
              loadError instanceof Error
                ? loadError.message
                : 'Failed to load plugin',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [attempt, key, pluginName, remoteModuleName]);

  if (error) {
    return (
      <RenderPluginsComponentErrorState
        pluginName={pluginName}
        remoteModuleName={remoteModuleName}
        onRetry={() => {
          setResult(undefined);
          setAttempt((current) => current + 1);
        }}
      />
    );
  }

  if (!Plugin) {
    return <PluginLoading />;
  }

  return (
    <Suspense fallback={<PluginLoading />}>
      <Plugin key={key} {...(props || {})} />
    </Suspense>
  );
}
