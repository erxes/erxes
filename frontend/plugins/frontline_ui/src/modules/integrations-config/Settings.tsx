import { lazy, Suspense, useState } from 'react';
import { IIntegrationItem } from '../settings/types/integration';
import {
  INTEGRATIONS,
  OTHER_INTEGRATIONS,
} from '../settings/constants/integrations';
import { IntegrationContext } from '../settings/context/IntegrationContext';
import { Button, PageContainer } from 'erxes-ui';

import { Outlet, Route, Routes } from 'react-router-dom';
import { PageHeader, PageHeaderStart } from 'ui-modules';
import { IconMailCog } from '@tabler/icons-react';
import { InboxPageChangeEffect } from '@/inbox/components/InboxPageChangeEffect';

export const IntegrationConfigPage = lazy(() =>
  import('~/pages/IntegrationConfigPage').then((module) => ({
    default: module.IntegrationConfigPage,
  })),
);

const IntegrationsConfigSettings = () => {
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
                <PageContainer className="flex-1 overflow-hidden">
                  <PageHeader>
                    <PageHeaderStart>
                      <Button variant={'ghost'} className="font-semibold">
                        <IconMailCog className="w-4 h-4 text-accent-foreground" />
                        Integrations config
                      </Button>
                    </PageHeaderStart>
                  </PageHeader>
                  <Outlet />
                </PageContainer>
              </div>
            }
          >
            <Route path="/" element={<IntegrationConfigPage />} />
          </Route>
        </Routes>
        <InboxPageChangeEffect />
      </Suspense>
    </IntegrationContext.Provider>
  );
};

export default IntegrationsConfigSettings;
