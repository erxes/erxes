import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const CheckProductsPage = lazy(() =>
  import('~/pages/CheckProductsPage').then((module) => ({
    default: module.CheckProductsPage,
  })),
);

const checkProductsMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<CheckProductsPage />} />
      </Routes>
    </Suspense>
  );
};

export default checkProductsMain;
