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
const BroadcastEditPage = lazy(() =>
  import('~/pages/broadcast/BroadcastEditPage').then((module) => ({
    default: module.BroadcastEditPage,
  })),
);

export const BroadcastRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route path="/" element={<BroadcastIndexPage />} />
        <Route path="/:messageId" element={<BroadcastDetailPage />} />
        <Route path="/:messageId/edit" element={<BroadcastEditPage />} />
      </Routes>
    </Suspense>
  );
};
