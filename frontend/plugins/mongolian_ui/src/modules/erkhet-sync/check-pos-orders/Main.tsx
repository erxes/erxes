import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const CheckPosOrdersPage = lazy(() =>
  import('~/pages/CheckPosOrdersPage').then((module) => ({
    default: module.CheckPosOrdersPage,
  })),
);

const checkPosOrdersMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<CheckPosOrdersPage />} />
      </Routes>
    </Suspense>
  );
};

export default checkPosOrdersMain;
