import { Navigate, Route, Routes } from 'react-router-dom';
import { lazyNamed } from '~/lib/lazyNamed';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { BroadcastsListPage } from './BroadcastsListPage';
import { SuppressionsPage } from './SuppressionsPage';

// The editor and report load when a broadcast is opened, not with the list.
const BroadcastPage = lazyNamed(() => import('./BroadcastPage'), 'BroadcastPage');

/** The Broadcasts app, mounted at `broadcasts/*`. */
export const BroadcastsRoutes = () => {
  const can = useCan();

  if (!can('broadcasts.view')) return <Navigate to={paths.home} replace />;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <Routes>
        <Route index element={<BroadcastsListPage />} />
        <Route path="suppressions" element={<SuppressionsPage />} />
        <Route path=":id" element={<BroadcastPage />} />
      </Routes>
    </div>
  );
};
