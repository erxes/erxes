import { lazy, Suspense } from 'react';
import { Button, PageContainer, Tooltip } from 'erxes-ui';

import { Link, Outlet, Route, Routes } from 'react-router-dom';
import { PageHeader, PageHeaderStart } from 'ui-modules';
import { IconInfoCircle, IconMailCog } from '@tabler/icons-react';
import { InboxPageChangeEffect } from '@/inbox/components/InboxPageChangeEffect';

export const IntegrationConfigPage = lazy(() =>
  import('~/pages/IntegrationConfigPage').then((module) => ({
    default: module.IntegrationConfigPage,
  })),
);

const IntegrationsConfigSettings = () => {
  const helpUrl =
    'https://erxes.io/guides/68ef769c1a9ddbd30aec6c35/6992b2975cac46b2ff76b25b';
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
                    <Tooltip>
                      <Tooltip.Trigger>
                        <Link to={helpUrl} target="_blank">
                          <IconInfoCircle className="size-4 text-accent-foreground" />
                        </Link>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        <p>Learn more about integrations config</p>
                      </Tooltip.Content>
                    </Tooltip>
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
