import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const Tms = lazy(() =>
  import('~/pages/tms/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

const TmsMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<Tms />} />
      </Routes>
    </Suspense>
  );
};

export default TmsMain;
