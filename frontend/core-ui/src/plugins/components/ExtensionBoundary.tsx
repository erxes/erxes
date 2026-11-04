import * as Sentry from '@sentry/react';
import { Spinner } from 'erxes-ui';
import { Suspense } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import type { PlacementBoundary } from 'ui-modules';
import { RenderPluginsComponentCrashState } from './RenderPluginsComponentCrashState';

/**
 * Where an extension's component renders: a spinner while its chunk loads,
 * and only its own spot shows a crash.
 */
export const ExtensionBoundary: PlacementBoundary = ({
  pluginName,
  children,
}) => (
  <ErrorBoundary
    FallbackComponent={RenderPluginsComponentCrashState}
    resetKeys={[pluginName]}
    onError={(error, info) => {
      // The fallback hides the error; keep it visible for debugging.
      console.error(
        `[extension ${pluginName}] render failed`,
        error,
        info.componentStack,
      );
      Sentry.captureException(error, {
        extra: { pluginName, componentStack: info.componentStack },
      });
    }}
  >
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Spinner />
        </div>
      }
    >
      {children}
    </Suspense>
  </ErrorBoundary>
);
