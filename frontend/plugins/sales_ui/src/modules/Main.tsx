import { Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';
import { Spinner } from 'erxes-ui';

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

const ReportsMain = lazy(() =>
  import('~/pages/ReportsPage').then((module) => ({
    default: module.ReportsPage,
  })),
);

const SalesMain = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/deals" element={<DealsMain />} />
        <Route path="/pos/*" element={<PosMain />} />
        <Route path="/reports" element={<ReportsMain />} />
      </Routes>
    </Suspense>
  );
};

export default SalesMain;