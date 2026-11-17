import { lazy, Suspense } from 'react';
import { Button } from 'erxes-ui';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { PageHeader, PageHeaderStart } from 'ui-modules';
import { IconMailCog } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { InboxPageChangeEffect } from '@/inbox/components/InboxPageChangeEffect';
import { ChannelWorkspaceFrame } from '@/channels/components/settings/channel-workspace/ChannelWorkspaceFrame';
import { IntegrationConfigNav } from '@/integrations-config/components/IntegrationConfigNav';
import { useConfigProviders } from '@/integrations-config/hooks/useConfigProviders';

export const IntegrationConfigPage = lazy(() =>
  import('~/pages/IntegrationConfigPage').then((module) => ({
    default: module.IntegrationConfigPage,
  })),
);

const IntegrationsConfigLayout = () => {
  const { t } = useTranslation();
  const providers = useConfigProviders();

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      <PageHeader>
        <PageHeaderStart>
          <Button variant={'ghost'} className="font-semibold">
            <IconMailCog className="w-4 h-4 text-accent-foreground" />
            {t('integrations.config.header', 'Integrations config')}
          </Button>
        </PageHeaderStart>
      </PageHeader>
      <ChannelWorkspaceFrame
        nav={<IntegrationConfigNav providers={providers} />}
      >
        <Outlet />
      </ChannelWorkspaceFrame>
    </div>
  );
};

const IntegrationsConfigIndex = () => {
  const [firstProvider] = useConfigProviders();

  return <Navigate to={firstProvider.segment} replace />;
};

const IntegrationsConfigSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route element={<IntegrationsConfigLayout />}>
          <Route index element={<IntegrationsConfigIndex />} />
          <Route path=":provider" element={<IntegrationConfigPage />} />
        </Route>
      </Routes>
      <InboxPageChangeEffect />
    </Suspense>
  );
};

export default IntegrationsConfigSettings;
