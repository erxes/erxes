import { FrontlinePaths } from '@/types/FrontlinePaths';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { usePermissionCheck } from 'ui-modules';

const ConfigsSettings = lazy(() => import('@/integrations-config/Settings'));

const ChannelsSettings = lazy(
  () => import('@/channels/components/settings/Settings'),
);

const FormPreviewPage = lazy(() =>
  import('~/pages/FormPreviewPage').then((module) => ({
    default: module.FormPreviewPage,
  })),
);

const IntegrationsConfigRoute = () => {
  const { isLoaded, hasActionPermission } = usePermissionCheck();

  if (!isLoaded) {
    return null;
  }

  if (!hasActionPermission('integrationsEdit')) {
    return <Navigate to="/settings" replace />;
  }

  return <ConfigsSettings />;
};

const FrontlineSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route
          path={FrontlinePaths.IntegrationConfig}
          element={<IntegrationsConfigRoute />}
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
