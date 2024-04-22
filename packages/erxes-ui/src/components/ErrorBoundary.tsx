import React, { useState } from 'react';

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({ error }: { error: Error | null }) => (
  <p>Something went wrong. ({error?.message})</p>
);

const ErrorBoundary: React.FC<{ children: any; pluginName?: string }> = ({
  children,
  pluginName,
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo);
    setHasError(true);
  };

  if (hasError) {
    // You can render any custom fallback UI
    return <ErrorFallback error={null} />;
  }

  return (
    <ReactErrorBoundary fallbackRender={ErrorFallback} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
