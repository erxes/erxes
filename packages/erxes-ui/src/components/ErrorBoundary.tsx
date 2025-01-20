import React, { useState } from 'react';

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

const ErrorFallback = ({
  error,
  pluginName,
}: {
  error: Error | null;
  pluginName?: string;
}) => (
  <p>
    Something went wrong. ({pluginName ? `${pluginName}: ` : ''}
    {error?.message})
  </p>
);

const ErrorBoundary: React.FC<{
  children: any;
  pluginName?: string;
  error?: Error;
}> = ({ children, pluginName, error }) => {
  const [hasError, setHasError] = useState(false);

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // You can also log the error to an error reporting service
    console.error(error, errorInfo, pluginName);
    setHasError(true);
  };

  if (hasError) {
    // You can render any custom fallback UI
    return <ErrorFallback error={error || null} pluginName={pluginName} />;
  }

  return (
    <ReactErrorBoundary fallbackRender={ErrorFallback} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  );
};

export default ErrorBoundary;
