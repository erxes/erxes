import React from 'react';

/**
 * Loading fallback component for async content
 */
export const TriggerContentLoadingFallback = React.memo(() => (
  <div
    className="flex items-center justify-center h-32"
    role="status"
    aria-label="Loading trigger configuration"
  >
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="sr-only">Loading...</span>
  </div>
));
