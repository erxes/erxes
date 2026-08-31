import { PIPELINE_TAB_SEGMENTS } from '@/pipelines/constants/pipelineTabs';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { PageContainer } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { Outlet } from 'react-router-dom';
import { SettingsHeader } from 'ui-modules';
import { ChannelSettingsPageEffect } from '@/channels/components/settings/ChannelSettingsPageEffect';
import { ChannelSettingsBreadcrumb } from '@/channels/components/settings/breadcrumbs/ChannelSettingsBreadcrumb';

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

export const ChannelResponsePage = lazy(() =>
  import('~/pages/ResponsePage').then((module) => ({
    default: module.ChannelResponsePage,
  })),
);

export const ChannelPollsPage = lazy(() =>
  import('~/pages/ChannelPollsPage').then((module) => ({
    default: module.ChannelPollsPage,
  })),
);

export const ChannelFormsPage = lazy(() =>
  import('~/pages/FormsPage').then((module) => ({
    default: module.FormsPage,
  })),
);

export const FormCreatePage = lazy(() =>
  import('~/pages/FormCreatePage').then((module) => ({
    default: module.FormCreatePage,
  })),
);

export const FormDetailPage = lazy(() =>
  import('~/pages/FormDetailPage').then((module) => ({
    default: module.default,
  })),
);

const FormSubmissionIndexPage = lazy(() =>
  import('~/pages/FormSubmissionsPage').then((module) => ({
    default: module.default,
  })),
);

export const ChannelsSettingsIndexPage = lazy(() =>
  import('~/pages/ChannelsSettingsIndexPage').then((module) => ({
    default: module.ChannelsSettingsIndexPage,
  })),
);

export const ChannelDetailsPage = lazy(() =>
  import('~/pages/ChannelDetailsPage').then((module) => ({
    default: module.ChannelDetailsPage,
  })),
);

export const ChannelMembersPage = lazy(() =>
  import('~/pages/ChannelMembersPage').then((module) => ({
    default: module.ChannelMembersPage,
  })),
);

export const PipelineLayoutPage = lazy(() =>
  import('~/pages/PipelineLayoutPage').then((module) => ({
    default: module.PipelineLayoutPage,
  })),
);

export const PipelineDetailPage = lazy(() =>
  import('~/pages/PipelineDetailPage').then((module) => ({
    default: module.PipelineDetailPage,
  })),
);

export const PipelineConfigsPage = lazy(() =>
  import('~/pages/PipelineConfigsPage').then((module) => ({
    default: module.PipelineConfigsPage,
  })),
);

export const PipelinePermissionsPage = lazy(() =>
  import('~/pages/PipelinePermissionsPage').then((module) => ({
    default: module.PipelinePermissionsPage,
  })),
);

export const PipelinePropertiesPage = lazy(() =>
  import('~/pages/PipelinePropertiesPage').then((module) => ({
    default: module.PipelinePropertiesPage,
  })),
);

export const TicketStatusesPage = lazy(() =>
  import('~/pages/TicketStatusesPage').then((module) => ({
    default: module.TicketStatusesPage,
  })),
);

export const ResponseDetailPage = lazy(() =>
  import('~/pages/ResponseDetailPage').then((module) => ({
    default: module.ResponseDetailPage,
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
            element={<PipelineLayoutPage />}
          >
            <Route index element={<PipelineDetailPage />} />
            <Route
              path={PIPELINE_TAB_SEGMENTS.statuses}
              element={<TicketStatusesPage />}
            />
            <Route
              path={PIPELINE_TAB_SEGMENTS.configs}
              element={<PipelineConfigsPage />}
            />
            <Route
              path={PIPELINE_TAB_SEGMENTS.permissions}
              element={<PipelinePermissionsPage />}
            />
            <Route
              path={PIPELINE_TAB_SEGMENTS.properties}
              element={<PipelinePropertiesPage />}
            />
          </Route>
          <Route
            path={FrontlinePaths.ChannelResponsePage}
            element={<ChannelResponsePage />}
          />
          <Route
            path={FrontlinePaths.ResponseDetail}
            element={<ResponseDetailPage />}
          />
          <Route
            path={FrontlinePaths.ChannelForms}
            element={<ChannelFormsPage />}
          />
          <Route
            path={FrontlinePaths.ChannelPolls}
            element={<ChannelPollsPage />}
          />
          <Route
            path={FrontlinePaths.FormsCreate}
            element={<FormCreatePage />}
          />
          <Route
            path={FrontlinePaths.FormDetail}
            element={<FormDetailPage />}
          />
          <Route
            path={FrontlinePaths.FormSubmissions}
            element={<FormSubmissionIndexPage />}
          />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default ChannelsSettings;
