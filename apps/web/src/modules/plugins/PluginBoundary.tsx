import { IconPlugConnectedX, IconRefresh } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import type { ReactNode } from 'react';
import { ErrorBoundary, useErrorBoundary } from 'react-error-boundary';
import { messageOf } from '@erxes/core-contract/client';

/** Why a plugin's part is missing; `compact` for a section inside a core page. */
export const PluginFailure = ({
  title,
  message,
  onRetry,
  compact = false,
}: {
  title: string;
  message: string;
  onRetry?: () => void;
  compact?: boolean;
}) => (
  <div
    role="alert"
    className={
      compact
        ? 'flex flex-col items-start gap-2 py-1 text-xs'
        : 'flex h-full flex-col items-center justify-center gap-3 p-6 text-center'
    }
  >
    {!compact && <IconPlugConnectedX className="size-8 text-muted-foreground" />}
    <div className="space-y-1">
      <p className={compact ? 'font-medium' : 'text-sm font-medium'}>{title}</p>
      <p className={compact ? 'text-muted-foreground' : 'max-w-md text-sm text-muted-foreground'}>
        {message}
      </p>
    </div>
    {onRetry && (
      <Button variant="outline" size={compact ? 'sm' : undefined} onClick={onRetry}>
        <IconRefresh />
        Try again
      </Button>
    )}
  </div>
);

const PluginCrash = ({ name, compact }: { name: string; compact: boolean }) => {
  const { error, resetBoundary } = useErrorBoundary();

  return (
    <PluginFailure
      title={`${name} stopped working`}
      message={messageOf(error)}
      onRetry={resetBoundary}
      compact={compact}
    />
  );
};

/** One plugin failing to draw must not take core down: a page, or a section of a core page. */
export const PluginBoundary = ({
  name,
  compact = false,
  resetKey,
  children,
}: {
  name: string;
  compact?: boolean;
  /** A change (another record) tries again. */
  resetKey?: string;
  children: ReactNode;
}) => (
  <ErrorBoundary
    resetKeys={[resetKey]}
    onError={(error, info) =>
      console.error(`[plugins] ${name} crashed`, error, info.componentStack)
    }
    fallback={<PluginCrash name={name} compact={compact} />}
  >
    {children}
  </ErrorBoundary>
);
