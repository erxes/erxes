import { loadRemote } from '@module-federation/enhanced/runtime';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

interface RemoteComponentProps {
  module?: string;
}
export const RenderPluginsComponentErrorState = ({
  pluginName,
  remoteModuleName,
  setPlugin,
  setHasError,
  setIsLoading,
}: {
  pluginName: string;
  remoteModuleName: string;
  setPlugin: React.Dispatch<
    React.SetStateAction<React.ComponentType<RemoteComponentProps> | null>
  >;
  setHasError: React.Dispatch<
    React.SetStateAction<{
      message: string;
    } | null>
  >;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const retry = () => {
    setHasError(null);
    setIsLoading(true);
    loadRemote<{ default: React.ComponentType<RemoteComponentProps> }>(
      `${pluginName}/${remoteModuleName}`,
      { from: 'runtime' },
    )
      .then((remoteModule) => {
        if (!remoteModule?.default)
          throw new Error('Plugin module is empty or invalid');
        setPlugin(() => remoteModule.default);
      })
      .catch((error) => {
        setHasError({
          message:
            error instanceof Error ? error.message : 'Failed to load plugin',
        });
        setPlugin(null);
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950/40">
        <IconAlertTriangle className="size-5 text-amber-500" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold">Module unavailable</p>
        <code className="block text-xs text-muted-foreground">
          {pluginName}/{remoteModuleName}
        </code>
        <p className="text-xs text-muted-foreground">failed to load</p>
      </div>
      <button
        onClick={retry}
        className="flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
      >
        <IconRefresh className="size-3.5" />
        Try again
      </button>
    </div>
  );
};
