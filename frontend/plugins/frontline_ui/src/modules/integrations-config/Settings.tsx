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
            // 1. Хамгийн гадна тал нь дэлгэцийг дүүргэсэн, scroll-гүй байна
            <div className="flex flex-col h-full w-full overflow-hidden">
              <PageHeader>
                <PageHeaderStart>
                  <Button variant={'ghost'} className="font-semibold">
                    <IconMailCog className="w-4 h-4 text-accent-foreground" />
                    Integrations config
                  </Button>
                </PageHeaderStart>
              </PageHeader>

              {/* 2. Зөвхөн энэ хэсэг scroll-доно.*/}
              <PageContainer className="flex-1 overflow-y-auto p-4">
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
