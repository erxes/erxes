import { DataExtensionsPath } from '@/types/paths/DataExtensionsPath';
import { Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const DataExtensionsIndexPage = lazy(() =>
  import('~/pages/data-extensions/DataExtensionsIndexPage').then((module) => ({
    default: module.DataExtensionsIndexPage,
  })),
);

export const DataExtensionsRoutes = () => {
  return (
    <Suspense fallback={<Spinner withMascot />}>
      <Routes>
        <Route
          path={DataExtensionsPath.Index}
          element={<DataExtensionsIndexPage />}
        />
      </Routes>
    </Suspense>
  );
};
