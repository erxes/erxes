import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const BroadcastIndexPage = lazy(() =>
  import('~/pages/broadcast/BroadcastIndexPage').then((module) => ({
    default: module.default,
  })),
);

const BroadcastDetailPage = lazy(() =>
  import('~/pages/broadcast/BroadcastDetailPage').then((module) => ({
    default: module.BroadcastDetailPage,
  })),
);

export const BroadcastRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route path="/" element={<BroadcastIndexPage />} />
        <Route path="/:messageId" element={<BroadcastDetailPage />} />
      </Routes>
    </Suspense>
  );
};
