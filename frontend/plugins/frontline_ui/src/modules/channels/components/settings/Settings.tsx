import { FrontlinePaths } from '@/types/FrontlinePaths';
import { PageContainer } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { Outlet } from 'react-router-dom';
import { SettingsHeader } from 'ui-modules';
import { ChannelDetailsPage } from '~/pages/ChannelDetailsPage';
import { ChannelMembersPage } from '~/pages/ChannelMembersPage';
import { ChannelsSettingsIndexPage } from '~/pages/ChannelsSettingsIndexPage';
import { PipelineDetailPage } from '~/pages/PipelineDetailPage';
import { ChannelSettingsPageEffect } from '@/channels/components/settings/ChannelSettingsPageEffect';
import { ChannelSettingsBreadcrumb } from '@/channels/components/settings/breadcrumbs/ChannelSettingsBreadcrumb';
import { PipielineConfigListPage } from '~/pages/PipielineConfigListPage';
import { TicketStatusesPage } from '~/pages/TicketStatusesPage';

export const IntegrationDetailPage = lazy(() =>
  import('~/pages/IntegrationDetailPage').then((module) => ({
    default: module.IntegrationDetailPage,
  })),
);

export const ErxesMessengerPreview = lazy(() =>
  import('~/pages/ErxesMessengerPreview').then((module) => ({
    default: module.ErxesMessengerPreview,
  })),
);

export const IntegrationConfigPage = lazy(() =>
  import('~/pages/IntegrationConfigPage').then((module) => ({
    default: module.IntegrationConfigPage,
  })),
);

export const ChannelPipelinesPage = lazy(() =>
  import('~/pages/PipelinesPage').then((module) => ({
    default: module.ChannelPipelinesPage,
  })),
);

const ChannelsSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <ChannelSettingsPageEffect />
      <Routes>
        <Route
          path={FrontlinePaths.ErxesMessengerPreview}
          element={<ErxesMessengerPreview />}
        />
        <Route
          element={
            <PageContainer>
              <SettingsHeader breadcrumbs={<ChannelSettingsBreadcrumb />} />
              <Outlet />
            </PageContainer>
          }
        >
          <Route path="/" element={<ChannelsSettingsIndexPage />} />
          <Route
            path={FrontlinePaths.ChannelDetails}
            element={<ChannelDetailsPage />}
          />
          <Route
            path={FrontlinePaths.ChannelMembers}
            element={<ChannelMembersPage />}
          />
          <Route
            path={FrontlinePaths.ChannelIntegrations}
            element={<IntegrationDetailPage />}
          />
          <Route
            path={FrontlinePaths.ChannelPipelines}
            element={<ChannelPipelinesPage />}
          />
          <Route
            path={FrontlinePaths.PipelineDetail}
            element={<PipelineDetailPage />}
          />
          <Route
            path={FrontlinePaths.TicketsConfigs}
            element={<PipielineConfigListPage />}
          />
          <Route
            path={FrontlinePaths.TicketsStatuses}
            element={<TicketStatusesPage />}
          />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default ChannelsSettings;
