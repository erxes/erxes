import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const BroadcastIndexPage = lazy(() =>
  import('~/pages/broadcast/BroadcastIndexPage').then((module) => ({
    default: module.default,
  })),
);

export const BroadcastRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route path="/" element={<BroadcastIndexPage />} />
      </Routes>
    </Suspense>
  );
};
