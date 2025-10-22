import { FrontlinePaths } from '@/types/FrontlinePaths';
import { IconMail } from '@tabler/icons-react';
import { Button, PageContainer } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { Outlet } from 'react-router-dom';
import { SettingsHeader } from 'ui-modules';
import { ChannelDetailsPage } from '~/pages/ChannelDetailsPage';
import { ChannelMembersPage } from '~/pages/ChannelMembersPage';
import { ChannelsSettingsIndexPage } from '~/pages/ChannelsSettingsIndexPage';

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

const ChannelsSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route
          element={
            <PageContainer>
              <SettingsHeader
                breadcrumbs={
                  <Button variant="ghost" className="font-semibold">
                    <IconMail className="w-4 h-4 text-accent-foreground" />
                    Channels
                  </Button>
                }
              />
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
        </Route>
        <Route
          path={FrontlinePaths.ErxesMessengerPreview}
          element={<ErxesMessengerPreview />}
        />
      </Routes>
    </Suspense>
  );
};

export default ChannelsSettings;
