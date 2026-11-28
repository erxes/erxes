import { Navigate, Route, Routes } from 'react-router-dom';
import { lazyNamed } from '~/lib/lazyNamed';
import { paths } from '~/lib/paths';
import { useCan } from '~/modules/auth/session';
import { BroadcastsListPage } from './BroadcastsListPage';
import { SuppressionsPage } from './SuppressionsPage';
import { TemplatesPage } from './templates/TemplatesPage';

// The editor and report load when a broadcast is opened, not with the list.
const BroadcastPage = lazyNamed(() => import('./BroadcastPage'), 'BroadcastPage');

// A template opens in the same email editor, loaded with it.
const TemplatePage = lazyNamed(() => import('./templates/TemplatePage'), 'TemplatePage');

/**
 * The Broadcasts app, mounted at `broadcasts/*`. Templates are self-hosted only: SaaS shows no
 * link to them, and their pages say why when opened anyway (402 NOT_IN_PLAN).
 */
export const BroadcastsRoutes = () => {
  const can = useCan();

  if (!can('broadcasts.view')) return <Navigate to={paths.home} replace />;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <Routes>
        <Route index element={<BroadcastsListPage />} />
        <Route path="suppressions" element={<SuppressionsPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="templates/:id" element={<TemplatePage />} />
        <Route path=":id" element={<BroadcastPage />} />
      </Routes>
    </div>
  );
};
