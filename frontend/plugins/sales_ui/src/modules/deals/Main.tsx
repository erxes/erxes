import { Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';

import { Spinner } from 'erxes-ui/components';

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
      </Routes>
    </Suspense>
  );
};

export default App;
