import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { ComponentsPath } from '@/types/paths/ComponentsPath';

const SelectComponentsIndexPage = lazy(() =>
  import('~/pages/components/SelectComponentIndexPage').then((module) => ({
    default: module.SelectComponentIndexPage,
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
              to={`${ComponentsPath.Index}${ComponentsPath.Select}`}
              replace
            />
          }
        />
        <Route
          path={ComponentsPath.Select}
          element={<SelectComponentsIndexPage />}
        />
      </Routes>
    </Suspense>
  );
};
