import { ReactNode, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { Spinner } from 'erxes-ui';
import { PluginErrorBoundary } from '~/components/PluginErrorBoundary';

/**
 * Shared route scaffold for the plugin's lazy route modules: the error boundary
 * (recovers from failed chunk loads), a Suspense spinner, and the index /
 * wildcard redirects to a default path. Each module supplies only its concrete
 * `<Route>` list as children.
 */
export const PluginRoutesShell = ({
  defaultPath,
  children,
}: {
  defaultPath: string;
  children: ReactNode;
}) => (
  <PluginErrorBoundary>
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route index element={<Navigate to={defaultPath} replace />} />
        {children}
        <Route path="*" element={<Navigate to={defaultPath} replace />} />
      </Routes>
    </Suspense>
  </PluginErrorBoundary>
);
