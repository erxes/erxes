import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

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

const TmsMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/tms" element={<Tms />} />
        <Route path="/tms/branches/:branchId" element={<TmsBranchDetail />} />
        <Route path="branches/:branchId" element={<TmsBranchDetail />} />
        <Route path="/pms" element={<Pms />} />
      </Routes>
    </Suspense>
  );
};

export default TmsMain;
