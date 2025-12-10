import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const DuplicatedPage = lazy(() =>
  import('~/pages/PutResponseDuplicatedPage').then((module) => ({
    default: module.DuplicatedPage,
  })),
);

const duplicatedMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<DuplicatedPage />} />
      </Routes>
    </Suspense>
  );
};

export default duplicatedMain;
