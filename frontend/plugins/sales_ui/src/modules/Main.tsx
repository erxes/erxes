import { Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';

import { Spinner } from 'erxes-ui/components';

const DealsMain = lazy(() =>
  import('~/pages/SalesIndexPage').then((module) => ({
    default: module.SalesIndexPage,
  })),
);

const PosMain = lazy(() =>
  import('~/pages/PosIndexPage').then((module) => ({
    default: module.PosIndexPage,
  })),
);

const PosEditPage = lazy(() =>
  import('~/pages/PosEditPage').then((module) => ({
    default: module.PosEditPage,
  })),
);

const SalesMain = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/deals" element={<DealsMain />} />
        <Route path="/pos" element={<PosMain />} />
        <Route path="/pos/:id" element={<PosEditPage />} />
      </Routes>
    </Suspense>
  );
};

export default SalesMain;
