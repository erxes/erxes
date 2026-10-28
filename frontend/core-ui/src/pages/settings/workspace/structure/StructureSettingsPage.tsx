import { StructureSettingsBreadcrumb } from '@/settings/structure/components/StructureSettingsBreadcrumb';
import { StructureTopbar } from '@/settings/structure/components/StructureTopbar';
import {
  STRUCTURE_READ_ACTION,
  STRUCTURE_SETTINGS_PATH,
} from '@/settings/structure/constants/structureCapabilities';
import { ReactFlowProvider } from '@xyflow/react';
import { PageContainer, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Can, SettingsHeader } from 'ui-modules';
import { NoAccessPage } from '~/pages/no-access/NoAccessPage';

const StructureWorkspace = lazy(() =>
  import('@/settings/structure/components/StructureWorkspace').then(
    (module) => ({
      default: module.StructureWorkspace,
    }),
  ),
);

export const StructureSettingsPage = () => (
  <ReactFlowProvider>
    <PageContainer>
      <SettingsHeader breadcrumbs={<StructureSettingsBreadcrumb />}>
        <StructureTopbar />
      </SettingsHeader>
      <div className="flex flex-auto w-full overflow-hidden">
        <Can action={STRUCTURE_READ_ACTION} fallback={<NoAccessPage />}>
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-full w-full">
                <Spinner />
              </div>
            }
          >
            <Routes>
              <Route index element={<StructureWorkspace />} />
              <Route
                path="types"
                element={<Navigate to={STRUCTURE_SETTINGS_PATH} replace />}
              />
            </Routes>
          </Suspense>
        </Can>
      </div>
    </PageContainer>
  </ReactFlowProvider>
);
