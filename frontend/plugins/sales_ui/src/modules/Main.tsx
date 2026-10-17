import { Navigate, Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';

import { Spinner, AppLayout } from 'erxes-ui';
import { SalesSidebar, SalesSidebarFooter } from '~/Sidebar';

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

export default SalesMain;
