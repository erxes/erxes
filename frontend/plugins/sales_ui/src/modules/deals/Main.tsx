import { Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';

import { Spinner } from 'erxes-ui/components';
import { PosIndexPage } from '~/pages/PosIndexPage';
import { SalesIndexPage } from '~/pages/SalesIndexPage';

const DealsMain = lazy(() =>
  import('~/pages/SalesIndexPage').then((module) => ({
    default: module.SalesIndexPage,
  })),
);

const App = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<DealsMain />} />
        <Route path="/pos" element={<PosIndexPage />} />
        <Route path="/deals" element={<SalesIndexPage />} />
      </Routes>
    </Suspense>
  );
};

export default App;
