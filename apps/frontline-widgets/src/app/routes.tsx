import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { Button } from 'erxes-ui';
import { postMessage } from '@libs/utils';
import { replayEarlyPublisherMessages } from '@libs/earlyPublisherMessages';

// Each route is its own chunk: the messenger iframe never downloads form
// code and the form iframe never downloads messenger code.
const App = lazy(() => import('./app').then((m) => ({ default: m.App })));
const Form = lazy(() => import('./form').then((m) => ({ default: m.Form })));
const LiveForm = lazy(() =>
  import('./form/live-form').then((m) => ({ default: m.LiveForm })),
);

// A route chunk can fail to load (offline, or a deploy removed the previous
// hashed files). Offer a reload instead of a blank widget. On the messenger
// route, keep answering the launcher so the user can actually see this.
const RouteErrorFallback = ({ isMessenger }: { isMessenger?: boolean }) => {
  useEffect(() => {
    if (!isMessenger) {
      return;
    }

    let isVisible = false;

    const handleMessage = (event: MessageEvent) => {
      const { fromPublisher, action } = event.data || {};

      if (!fromPublisher || action !== 'toggleMessenger') {
        return;
      }

      const nextIsVisible =
        typeof event.data.isVisible === 'boolean'
          ? event.data.isVisible
          : !isVisible;

      if (nextIsVisible !== isVisible) {
        isVisible = nextIsVisible;
        postMessage('fromMessenger', 'messenger', { isVisible });
      }
    };

    window.addEventListener('message', handleMessage);
    replayEarlyPublisherMessages();

    return () => window.removeEventListener('message', handleMessage);
  }, [isMessenger]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center bg-background">
      <p className="text-sm text-muted-foreground">
        This widget couldn't load. Check your connection and try again.
      </p>
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </div>
  );
};

/**
 * Add new routes here.
 * Example:
 *   <Route path="/form/:formId" element={<FormWidget />} />
 *   <Route path="/booking" element={<BookingWidget />} />
 */
export function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route
          path="/"
          element={
            <ErrorBoundary fallback={<RouteErrorFallback isMessenger />}>
              <App />
            </ErrorBoundary>
          }
        />
        <Route
          path="/form"
          element={
            <ErrorBoundary fallback={<RouteErrorFallback />}>
              <Form />
            </ErrorBoundary>
          }
        />
        <Route
          path="/live/:id/:formId"
          element={
            <ErrorBoundary fallback={<RouteErrorFallback />}>
              <LiveForm />
            </ErrorBoundary>
          }
        />
      </Routes>
    </Suspense>
  );
}
