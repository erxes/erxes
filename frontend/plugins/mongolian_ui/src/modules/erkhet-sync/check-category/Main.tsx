import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const CheckCategoryPage = lazy(() =>
  import('~/pages/CheckCategoryPage').then((module) => ({
    default: module.CheckCategoryPage,
  })),
);

const checkCategoryMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<CheckCategoryPage />} />
      </Routes>
    </Suspense>
  );
};

export default checkCategoryMain;
