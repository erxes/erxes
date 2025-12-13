import { Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';

import { Spinner } from 'erxes-ui/components';

const GoalsMain = lazy(() =>
  import('~/pages/GoalsIndexPage').then((module) => ({
    default: module.GoalsIndexPage,
  })),
);

const App = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<GoalsMain />} />
      </Routes>
    </Suspense>
  );
};

export default App;
