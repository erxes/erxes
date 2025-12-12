import { Filter, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { SettingsHeader } from 'ui-modules';
import { ErkhetSyncBreadcrumb } from './ErkhetSyncBreadcrumb';
import { SyncErkhetSidebar } from './SyncErkhetSiderbar';
export const ErkhetSyncGeneralConfig = lazy(() =>
  import('~/pages/SyncErkhetGeneralConfig').then((module) => ({
    default: module.SyncErkhetGeneralConfig,
  })),
);

const StageInReturnErkhetConfig = lazy(() =>
  import('~/pages/StageInReturnErkhetConfigPage').then((module) => ({
    default: module.StageInReturnErkhetConfig,
  })),
);

const StageInErkhetConfig = lazy(() =>
  import('~/pages/StageInErkhetConfigPage').then((module) => ({
    default: module.StageInErkhetConfig,
  })),
);

const PipelineRemainderConfig = lazy(() =>
  import('~/pages/PipelineRemainderConfigPage').then((module) => ({
    default: module.PipelineRemainderConfig,
  })),
);

const StageInErkhetMovementConfig = lazy(() =>
  import('~/pages/StageInErkhetMovementConfigPage').then((module) => ({
    default: module.StageInErkhetMovementConfig,
  })),
);

const StageInErkhetIncomeConfig = lazy(() =>
  import('~/pages/StageInErkhetIncomeConfigPage').then((module) => ({
    default: module.StageInErkhetIncomeConfig,
  })),
);

const ErkhetSettings = () => {
  return (
    <Filter id="sync-erkhet-settings">
      <div className="flex flex-col flex-auto overflow-hidden">
        <SettingsHeader breadcrumbs={<ErkhetSyncBreadcrumb />} />
        <div className="flex flex-auto overflow-hidden">
          <SyncErkhetSidebar />
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-full w-full">
                <Spinner />
              </div>
            }
          >
            <Routes>
              <Route path="/" element={<ErkhetSyncGeneralConfig />} />
              <Route path="/stage-in" element={<StageInErkhetConfig />} />
              <Route path="/return" element={<StageInReturnErkhetConfig />} />
              <Route path="/remainder" element={<PipelineRemainderConfig />} />
              <Route
                path="/movement"
                element={<StageInErkhetMovementConfig />}
              />
              <Route path="/income" element={<StageInErkhetIncomeConfig />} />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Filter>
  );
};
export default ErkhetSettings;
