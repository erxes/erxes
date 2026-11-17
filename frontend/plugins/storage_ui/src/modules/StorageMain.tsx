import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { AppLayout, AppLayoutFooterLink, Spinner } from 'erxes-ui';
import { IconArrowLeft, IconSettings } from '@tabler/icons-react';
import { PluginSettingsRoutes, PluginSharedSettingsNavigation } from 'ui-modules';
import { StorageNavigation } from './StorageNavigation';
import { StorageSettingsNavigation } from './StorageSettingsNavigation';

const Settings = lazy(() =>
  import('./StorageSettings').then((module) => ({
    default: module.StorageSettings,
  })),
);

const IndexPage = lazy(() =>
  import('~/pages/storage/IndexPage').then((module) => ({
    default: module.IndexPage,
  })),
);

export const StorageMain = () => {
  return (
    <Routes>
      <Route path="settings/*" element={
        <AppLayout
          id="storage:settings"
          title="Storage Settings"
          sidebar={<>
            <StorageSettingsNavigation />
            <PluginSharedSettingsNavigation pluginName="storage" pathPrefix="storage/settings" />
          </>}
          footer={<AppLayoutFooterLink path="storage/storage" name="Back to Storage" icon={IconArrowLeft} />}
        >
          <Suspense fallback={<Spinner />}>
            <PluginSettingsRoutes pluginName="storage" basePath="/storage/settings">
              <Routes>
                <Route index element={<Navigate to="storage" replace />} />
                <Route path="storage" element={<Settings />} />
              </Routes>
            </PluginSettingsRoutes>
          </Suspense>
        </AppLayout>
      } />
      <Route path="*" element={
        <AppLayout
          id="storage"
          title="Storage"
          sidebar={<StorageNavigation />}
          footer={<AppLayoutFooterLink path="storage/settings" name="App settings" icon={IconSettings} />}
        >
          <Suspense fallback={<Spinner />}>
            <Routes>
              <Route index element={<Navigate to="storage" replace />} />
              <Route path="storage" element={<IndexPage />} />
            </Routes>
          </Suspense>
        </AppLayout>
      } />
    </Routes>
  );
};
