import { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import * as Sentry from '@sentry/react';

import { GenericErrorFallback } from '@/error-handler/components/GenericErrorFallback';

export const AppErrorBoundary = ({ children }: { children: ReactNode }) => {
  const handleReset = () => {
    window.location.reload();
  };

  // React render crashes are caught here in-process, so Sentry receives the real
  // Error (with stack + component stack) — not the cross-origin "Script error."
  // that window.onerror would otherwise report for Module Federation remotes.
  const handleError = (
    error: Error,
    info: { componentStack?: string | null },
  ) => {
    Sentry.captureException(error, {
      extra: { componentStack: info.componentStack },
    });
  };

  return (
    <ErrorBoundary
      FallbackComponent={GenericErrorFallback}
      onReset={handleReset}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};
