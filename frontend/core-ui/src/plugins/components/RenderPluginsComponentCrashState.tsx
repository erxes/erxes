import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { FallbackProps } from 'react-error-boundary';

// A remote that loaded but broke while drawing; only its own spot shows it.
export const RenderPluginsComponentCrashState = ({
  resetErrorBoundary,
}: FallbackProps) => (
  <div className="flex items-center gap-2 rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
    <IconAlertTriangle className="size-4 shrink-0 text-amber-500" />
    <span className="flex-1">This part failed to show</span>
    <button
      type="button"
      onClick={resetErrorBoundary}
      className="flex items-center gap-1 rounded-md border bg-background px-2 py-1 font-medium transition-colors hover:bg-muted"
    >
      <IconRefresh className="size-3.5" />
      Try again
    </button>
  </div>
);
