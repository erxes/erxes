import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { ComponentsPaths } from '@/types/paths/ComponentsPaths';

const SelectComponentsIndexPage = lazy(() =>
  import('~/pages/components/SelectComponentIndexPage').then((module) => ({
    default: module.SelectComponentIndexPage,
  })),
);

const ReportPage = lazy(() =>
  import('~/pages/components/Reportpage').then((module) => ({
    default: module.ReportPage,
  })),
);

export const ComponentsRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route
          path="/"
          element={
            <Navigate
              to={`${ComponentsPaths.Index}${ComponentsPaths.Select}`}
              replace
            />
          }
        />
        <Route
          path={ComponentsPaths.Select}
          element={<SelectComponentsIndexPage />}
        />
        <Route path={ComponentsPaths.Report} element={<ReportPage />} />
      </Routes>
    </Suspense>
  );
};
