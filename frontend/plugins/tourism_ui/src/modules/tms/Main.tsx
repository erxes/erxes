import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const Tms = lazy(() =>
  import('~/pages/tms/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

const Pms = lazy(() =>
  import('~/pages/pms/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

const TourismMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/tms" element={<Tms />} />
        <Route path="/pms" element={<Pms />} />
      </Routes>
    </Suspense>
  );
};

export default TourismMain;
