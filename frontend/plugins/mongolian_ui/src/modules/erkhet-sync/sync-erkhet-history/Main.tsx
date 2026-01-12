import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

  const SyncErkhetHistoryPage = lazy(() =>
    import('~/pages/SyncErkhetHistoryPage').then((module) => ({
      default: module.SyncErkhetHistoryPage,
    })),
  );

const syncHistoryMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<SyncErkhetHistoryPage />} />
      </Routes>
    </Suspense>
  );
};

export default syncHistoryMain;
