import { ReactNode } from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { GenericErrorFallback } from '@/error-handler/components/GenericErrorFallback';

export const AppErrorBoundary = ({ children }: { children: ReactNode }) => {
  const handleReset = () => {
    window.location.reload();
  };

  return (
    <ErrorBoundary
      FallbackComponent={GenericErrorFallback}
      onReset={handleReset}
    >
      {children}
    </ErrorBoundary>
  );
};
