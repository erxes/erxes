import { lazy, Suspense, useState } from 'react';
import { IIntegrationItem } from '../settings/types/integration';
import {
  INTEGRATIONS,
  OTHER_INTEGRATIONS,
} from '../settings/constants/integrations';
import { IntegrationContext } from '../settings/context/IntegrationContext';
import { Button, PageContainer } from 'erxes-ui';

import { InboxSettingsTopbar } from '../settings/components/InboxSettingsTopbar';
import { InboxSettingsSidebar } from '../settings/components/Sidebar';
import { Outlet, Route, Routes } from 'react-router-dom';
import { PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { IconMailFilled } from '@tabler/icons-react';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { InboxPageChangeEffect } from '@/inbox/components/InboxPageChangeEffect';

export const IntegrationSettingsPage = lazy(() =>
  import('~/pages/IntegrationSettingsPage').then((module) => ({
    default: module.IntegrationSettingsPage,
  })),
);

export const ChannelsSettingsPage = lazy(() =>
  import('~/pages/ChannelsSettingsPage').then((module) => ({
    default: module.ChannelsSettingsPage,
  })),
);

export const IntegrationDetailPage = lazy(() =>
  import('~/pages/IntegrationDetailPage').then((module) => ({
    default: module.IntegrationDetailPage,
  })),
);

export const IntegrationConfigPage = lazy(() =>
  import('~/pages/IntegrationConfigPage').then((module) => ({
    default: module.IntegrationConfigPage,
  })),
);

export const ErxesMessengerPreview = lazy(() =>
  import('~/pages/ErxesMessengerPreview').then((module) => ({
    default: module.ErxesMessengerPreview,
  })),
);

const InboxSettings = () => {
  const [integrations, setIntegrations] =
    useState<Record<string, IIntegrationItem>>(INTEGRATIONS);
  const [otherIntegrations, setOtherIntegrations] =
    useState<Record<string, IIntegrationItem>>(OTHER_INTEGRATIONS);
  return (
    <IntegrationContext.Provider
      value={{
        integrations,
        setIntegrations,
        otherIntegrations,
        setOtherIntegrations,
      }}
    >
      <Suspense fallback={<div />}>
        <Routes>
          <Route
            element={
              <div className="flex flex-auto w-full overflow-hidden">
                <InboxSettingsSidebar />
                <PageContainer className="flex-1 overflow-hidden">
                  <PageHeader>
                    <PageHeaderStart>
                      <Button variant={'ghost'} className="font-semibold">
                        <IconMailFilled className="w-4 h-4 text-accent-foreground" />
                        Team inbox
                      </Button>
                    </PageHeaderStart>
                    <PageHeaderEnd>
                      <InboxSettingsTopbar />
                    </PageHeaderEnd>
                  </PageHeader>
                  <Outlet />
                </PageContainer>
              </div>
            }
          >
            <Route path="/" element={<IntegrationSettingsPage />} />
            <Route
              path={FrontlinePaths.IntegrationConfig}
              element={<IntegrationConfigPage />}
            />
          </Route>
          <Route
            path={FrontlinePaths.ErxesMessengerPreview}
            element={<ErxesMessengerPreview />}
          />
        </Routes>
        <InboxPageChangeEffect />
      </Suspense>
    </IntegrationContext.Provider>
  );
};

export default InboxSettings;
