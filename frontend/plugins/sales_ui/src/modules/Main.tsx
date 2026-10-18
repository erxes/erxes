import { PluginSettingsRoutes } from 'ui-modules';
import { Navigate, Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';

import { Spinner, AppLayout } from 'erxes-ui';
import {
  SalesSidebar,
  SalesSidebarFooter,
  SalesSettingsLayout,
} from '~/Sidebar';

const DealsMain = lazy(() =>
  import('~/pages/SalesIndexPage').then((module) => ({
    default: module.SalesIndexPage,
  })),
);

const PosMain = lazy(() =>
  import('./pos/Main').then((module) => ({
    default: module.default,
  })),
);

const SalesMain = () => {
  return (
    <AppLayout
      id="sales"
      title="Sales"
      sidebar={<SalesSidebar />}
      footer={<SalesSidebarFooter />}
    >
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route index element={<Navigate to="deals" replace />} />
          <Route path="/deals" element={<DealsMain />} />
          <Route path="/pos/*" element={<PosMain />} />
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

const SalesSettingsRoutes = lazy(
  () => import('~/pages/SalesSettingsIndexPage'),
);
// JSX needs a capitalised name.
const SalesAppRoutes = SalesMain;

/** The plugin owns its settings too: `/sales/settings/*` has its own sidebar. */
const SalesEntry = () => (
  <Routes>
    <Route
      path="settings/*"
      element={
        <SalesSettingsLayout>
          <Suspense fallback={<Spinner />}>
            <PluginSettingsRoutes pluginName="sales" basePath="/sales/settings">
              <SalesSettingsRoutes />
            </PluginSettingsRoutes>
          </Suspense>
        </SalesSettingsLayout>
      }
    />
    <Route path="*" element={<SalesAppRoutes />} />
  </Routes>
);

export default SalesEntry;
