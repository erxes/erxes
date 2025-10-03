import { lazy, Suspense } from 'react';
import { Route } from 'react-router';
import { Routes } from 'react-router';

import { SegmentsPath } from '@/types/paths/SegmentsPath';
import { Spinner } from 'erxes-ui';

const SegmentsIndexPage = lazy(
  () => import('~/pages/segments/SegmentsIndexPage'),
);

export const SegmentRoutes = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path={SegmentsPath.Index} element={<SegmentsIndexPage />} />
        <Route path={SegmentsPath.Detail} element={<SegmentsIndexPage />} />
      </Routes>
    </Suspense>
  );
};
