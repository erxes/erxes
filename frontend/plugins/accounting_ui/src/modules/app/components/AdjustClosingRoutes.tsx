import { Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { AdjustClosingPath } from '~/modules/adjustments/closing/types/adjustClosingPath';

const AdjustClosingIndexPage = lazy(() =>
  import('~/pages/AdjustClosingPage').then((module) => ({
    default: module.AdjustClosingListPage,
  })),
);
const AdjustClosingDetailPage = lazy(() =>
  import('~/pages/AdjustClosingDetailPage').then((module) => ({
    default: module.AdjustClosingDetailPage,
  })),
);

export const AdjustClosingRoutes = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route
          path={AdjustClosingPath.Index}
          element={<AdjustClosingIndexPage />}
        />
        <Route
          path={AdjustClosingPath.Details}
          element={<AdjustClosingDetailPage />}
        />
      </Routes>
    </Suspense>
  );
};
