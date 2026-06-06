import { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { Spinner } from 'erxes-ui';
import { ImportExportSettingsPath } from '@/import-export/settings/constants/importExportSettingsPaths';

export enum ImportExportPath {
  Import = 'import',
  Export = 'export',
}

export const ImportExportRoutes = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route
          index
          element={<Navigate to={ImportExportSettingsPath.Import} replace />}
        />
        <Route
          path={ImportExportPath.Import}
          element={<Navigate to={ImportExportSettingsPath.Import} replace />}
        />
        <Route
          path={ImportExportPath.Export}
          element={<Navigate to={ImportExportSettingsPath.Export} replace />}
        />
      </Routes>
    </Suspense>
  );
};
