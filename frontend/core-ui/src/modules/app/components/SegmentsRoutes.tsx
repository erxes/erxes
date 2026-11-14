import { SegmentsPath } from '@/types/paths/SegmentsPath';
import { Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const SegmentsIndexPage = lazy(
  () => import('~/pages/segments/SegmentsIndexPage'),
);
const SegmentDetailPage = lazy(() =>
  import('~/pages/segments/SegmentDetailPage').then((module) => ({
    default: module.SegmentDetailPage,
  })),
);

export const SegmentRoutes = () => {
  return (
    <Suspense fallback={<Spinner withMascot />}>
      <Routes>
        <Route path={SegmentsPath.Index} element={<SegmentsIndexPage />} />
        <Route path={SegmentsPath.Detail} element={<SegmentDetailPage />} />
      </Routes>
    </Suspense>
  );
};
