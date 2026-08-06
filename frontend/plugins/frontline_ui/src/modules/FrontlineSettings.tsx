import { FrontlinePaths } from '@/types/FrontlinePaths';
import { PageContainer } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { SettingsHeader } from 'ui-modules';
import { PersonalChannelBreadcrumb } from '@/channels/components/settings/personal-channel/PersonalChannelBreadcrumb';

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
