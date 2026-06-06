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

const SalesMain = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/deals" element={<DealsMain />} />
        <Route path="/pos/*" element={<PosMain />} />
      </Routes>
    </Suspense>
  );
};

export default SalesMain;
