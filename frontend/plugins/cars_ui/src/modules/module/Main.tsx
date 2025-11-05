import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const IndexPage = lazy(() =>
  import('~/pages/module/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

const moduleMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<IndexPage />} />
      </Routes>
    </Suspense>
  );
};

export default moduleMain;
