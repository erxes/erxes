import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const CheckSyncedDealsPage = lazy(() =>
  import('~/pages/CheckSyncedDealsPage').then((module) => ({
    default: module.CheckSyncedDealsPage,
  })),
);

const checkSyncedDealsMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<CheckSyncedDealsPage />} />
      </Routes>
    </Suspense>
  );
};

export default checkSyncedDealsMain;
