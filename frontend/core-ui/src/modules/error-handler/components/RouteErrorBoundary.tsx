import { useRouteError } from 'react-router-dom';
import * as Sentry from '@sentry/react';

import { GenericErrorFallback } from '@/error-handler/components/GenericErrorFallback';

/**
 * React Router's data router catches render errors thrown inside routed
 * components in its OWN internal boundary (RenderErrorBoundary) before they can
 * bubble up to the top-level <AppErrorBoundary>. Without a route-level
 * errorElement, those errors are swallowed by React Router's default boundary
 * and never reach Sentry (and React, having handled them, never fires
 * window.onerror either). Sentry's wrapCreateBrowserRouterV7 only adds tracing
 * spans — it does NOT capture these errors — so this errorElement is the single
 * capture point for routed render/loader errors.
 *
 * Wired as the root route's errorElement, this catches every routed error —
 * host pages AND Module Federation remotes (errors bubble to the nearest
 * ancestor errorElement) — reports it to Sentry, and renders the shared
 * fallback UI.
 *
 * Capture happens SYNCHRONOUSLY during render, not in a useEffect. Effects run
 * only after a successful commit, and React's concurrent error-recovery path
 * (recoverFromConcurrentError) can discard this element before effects flush —
 * which silently dropped the report and is why crashes showed in the dev
 * overlay but never reached Sentry. The WeakSet de-dupes the captures that
 * StrictMode's double render and React's sync error-recovery retries produce.
 */
const reportedErrors = new WeakSet<object>();

export const RouteErrorBoundary = () => {
  const error = useRouteError();

  if (error != null) {
    if (typeof error === 'object') {
      if (!reportedErrors.has(error)) {
        reportedErrors.add(error);
        Sentry.captureException(error);
      }
    } else {
      Sentry.captureException(error);
    }
  }

  return (
    <GenericErrorFallback
      error={error instanceof Error ? error : new Error(String(error))}
      resetErrorBoundary={() => window.location.reload()}
    />
  );
};
