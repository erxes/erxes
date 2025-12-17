import { lazy, Suspense } from 'react';
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
  return (
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
  );
};

export default IntegrationsConfigSettings;
