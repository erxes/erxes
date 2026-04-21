import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const Tms = lazy(() =>
  import('~/pages/tms/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);
const TmsBranchDetail = lazy(() =>
  import('~/pages/tms/BranchDetailIndexPage').then((module) => ({
    default: module.BranchDetailIndexPage,
  })),
);

const Pms = lazy(() =>
  import('~/pages/pms/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

const App = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route index element={<Navigate to="tms" replace />} />
        <Route path="tms" element={<Tms />} />
        <Route path="tms/branches/:branchId" element={<TmsBranchDetail />} />
        <Route path="pms" element={<Pms />} />
      </Routes>
    </Suspense>
  );
};

export default App;
