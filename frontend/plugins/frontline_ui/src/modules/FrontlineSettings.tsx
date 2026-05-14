import { FrontlinePaths } from '@/types/FrontlinePaths';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';

const ConfigsSettings = lazy(() => import('@/integrations-config/Settings'));

const ChannelsSettings = lazy(
  () => import('@/channels/components/settings/Settings'),
);

const FormPreviewPage = lazy(() =>
  import('~/pages/FormPreviewPage').then((module) => ({
    default: module.FormPreviewPage,
  })),
);

const FrontlineSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route
          path={FrontlinePaths.IntegrationConfig}
          element={<ConfigsSettings />}
        />
        <Route
          path={FrontlinePaths.ChannelsCatchAll}
          element={<ChannelsSettings />}
        />
        <Route
          path={`/forms${FrontlinePaths.FormPreview}`}
          element={<FormPreviewPage />}
        />
      </Routes>
    </Suspense>
  );
};

export default FrontlineSettings;
