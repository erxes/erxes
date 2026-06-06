import { ImportExportSettingsBreadcrumb } from '@/import-export/settings/components/ImportExportSettingsBreadcrumb';
import { ImportExportSettingsSidebar } from '@/import-export/settings/components/ImportExportSettingsSidebar';
import { ImportExportSettingsPath } from '@/import-export/settings/constants/importExportSettingsPaths';
import { PageContainer, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { SettingsHeader } from 'ui-modules';

const ImportHistoriesSettingsPage = lazy(() =>
  import('~/pages/settings/workspace/import-export/ImportHistoriesSettingsPage').then(
    (module) => ({
      default: module.ImportHistoriesSettingsPage,
    }),
  ),
);

const ExportHistoriesSettingsPage = lazy(() =>
  import('~/pages/settings/workspace/import-export/ExportHistoriesSettingsPage').then(
    (module) => ({
      default: module.ExportHistoriesSettingsPage,
    }),
  ),
);

export const ImportExportSettingsRoutes = () => {
  return (
    <PageContainer>
      <SettingsHeader breadcrumbs={<ImportExportSettingsBreadcrumb />} />
      <div className="flex flex-auto w-full min-w-0 overflow-hidden">
        <ImportExportSettingsSidebar />
        <div className="flex min-w-0 flex-1 overflow-hidden">
          <Suspense
            fallback={
              <div className="flex h-full w-full items-center justify-center">
                <Spinner />
              </div>
            }
          >
            <Routes>
              <Route
                index
                element={
                  <Navigate to={ImportExportSettingsPath.Import} replace />
                }
              />
              <Route path="import" element={<ImportHistoriesSettingsPage />} />
              <Route path="export" element={<ExportHistoriesSettingsPage />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </PageContainer>
  );
};
