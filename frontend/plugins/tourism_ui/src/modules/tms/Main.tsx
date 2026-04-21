import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

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

const TmsMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route index element={<Tms />} />
        <Route path="branches/:branchId" element={<TmsBranchDetail />} />
      </Routes>
    </Suspense>
  );
};

export default TmsMain;
