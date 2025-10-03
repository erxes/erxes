import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const Pms = lazy(() =>
  import('~/pages/pms/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

const PmsMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<Pms />} />
      </Routes>
    </Suspense>
  );
};

export default PmsMain;
