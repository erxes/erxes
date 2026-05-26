import { Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';

import { Spinner } from 'erxes-ui';

const BranchList = lazy(() =>
  import('./branched/components/BranchList').then((module) => ({
    default: module.default,
  })),
);

const BranchedMain = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path="/" element={<BranchList />} />
      </Routes>
    </Suspense>
  );
};

export default BranchedMain;