import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

export const RenderPluginsComponentErrorState = ({
  pluginName,
  remoteModuleName,
  onRetry,
}: {
  pluginName: string;
  remoteModuleName: string;
  onRetry: () => void;
}) => {
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
        onClick={onRetry}
        className="flex items-center gap-1.5 rounded-md border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted"
      >
        <IconRefresh className="size-3.5" />
        Try again
      </button>
    </div>
  );
};
