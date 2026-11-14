import { paths } from '~/lib/paths';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useCan } from '~/modules/auth/session';
import { AutomationEditorPage } from './AutomationEditorPage';
import { AutomationsListPage } from './AutomationsListPage';

/** The Automations app, mounted at `automations/*`. */
export const AutomationsRoutes = () => {
  const can = useCan();

  if (!can('automations.view')) return <Navigate to={paths.home} replace />;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <Routes>
        <Route index element={<AutomationsListPage />} />
        <Route path=":id" element={<AutomationEditorPage />} />
      </Routes>
    </div>
  );
};
