import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

import { Spinner } from 'erxes-ui';

const ImportIndexPage = lazy(() =>
  import('~/pages/import-export/ImportIndexPage').then((module) => ({
    default: module.ImportIndexPage,
  })),
);

const ExportIndexPage = lazy(() =>
  import('~/pages/import-export/ExportIndexPage').then((module) => ({
    default: module.ExportIndexPage,
  })),
);

export enum ImportExportPath {
  Import = '/import',
  Export = '/export',
}

export const ImportExportRoutes = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route path={ImportExportPath.Import} element={<ImportIndexPage />} />
        <Route path={ImportExportPath.Export} element={<ExportIndexPage />} />
      </Routes>
    </Suspense>
  );
};
