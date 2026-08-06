import { FrontlinePaths } from '@/types/FrontlinePaths';
import { PageContainer } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { SettingsHeader } from 'ui-modules';
import { PersonalChannelBreadcrumb } from '@/channels/components/settings/personal-channel/PersonalChannelBreadcrumb';
import { Navigate, Route, Routes } from 'react-router-dom';
import { usePermissionCheck } from 'ui-modules';

const ConfigsSettings = lazy(() => import('@/integrations-config/Settings'));

const ChannelsSettings = lazy(
  () => import('@/channels/components/settings/Settings'),
);

const PersonalChannelPage = lazy(() =>
  import('~/pages/PersonalChannelPage').then((module) => ({
    default: module.PersonalChannelPage,
  })),
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
          path={FrontlinePaths.PersonalChannel}
          element={
            <PageContainer>
              <SettingsHeader breadcrumbs={<PersonalChannelBreadcrumb />} />
              <PersonalChannelPage />
            </PageContainer>
          }
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
