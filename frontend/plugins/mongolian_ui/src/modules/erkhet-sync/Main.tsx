import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const ErkhetSyncHistoryPage = lazy(() =>
  import('~/pages/ErkhetSyncHistoryPage').then((module) => ({
    default: module.ErkhetSyncHistoryPage,
  })),
);

const erkhetSyncMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="/" element={<ErkhetSyncHistoryPage />} />
      </Routes>
    </Suspense>
  );
};

export default erkhetSyncMain;
