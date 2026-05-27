import { lazy, Suspense } from 'react';
import { Button, PageContainer } from 'erxes-ui';
import { Outlet, Route, Routes } from 'react-router-dom';
import { PageHeader, PageHeaderStart } from 'ui-modules';
import { IconMailCog } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { InboxPageChangeEffect } from '@/inbox/components/InboxPageChangeEffect';

export const IntegrationConfigPage = lazy(() =>
  import('~/pages/IntegrationConfigPage').then((module) => ({
    default: module.IntegrationConfigPage,
  })),
);

const IntegrationsConfigSettings = () => {
  // Initialize translation hook
  const { t } = useTranslation();

  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route
          element={
            <div className="flex flex-col h-full w-full overflow-hidden">
              <PageHeader>
                <PageHeaderStart>
                  <Button variant={'ghost'} className="font-semibold">
                    <IconMailCog className="w-4 h-4 text-accent-foreground" />
                    {t('integrations.config.header', 'Integrations config')}
                  </Button>
                </PageHeaderStart>
              </PageHeader>

              <PageContainer className="flex-1 py-3 overflow-y-auto hide-scroll styled-scroll">
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
