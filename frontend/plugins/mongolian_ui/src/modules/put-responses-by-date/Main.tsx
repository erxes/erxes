import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const ByDatePage = lazy(() =>
  import('~/pages/ByDatePage').then((module) => ({
    default: module.ByDatePage,
  })),
);

const byDateMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<ByDatePage />} />
      </Routes>
    </Suspense>
  );
};

export default byDateMain;
