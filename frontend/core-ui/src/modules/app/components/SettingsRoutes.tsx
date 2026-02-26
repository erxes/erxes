import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { getPluginsSettingsRoutes } from '@/app/hooks/usePluginsRouter';
import { SettingsPageEffect } from '@/settings/components/SettingsPageEffect';
import {
  SettingsPath,
  SettingsWorkspacePath,
} from '@/types/paths/SettingsPath';
import { Skeleton } from 'erxes-ui';
import { useVersion } from 'ui-modules';
import { ClientPortalDetailPage } from '~/pages/settings/client-portal/ClientPortalDetailPage';
import { ClientPortalPage } from '~/pages/settings/client-portal/ClientPortalPage';
import { TeamMemberSettingsRoutes } from '@/settings/team-member/components/TeamMemberSettingsRoutes';

const SettingsProfile = lazy(() =>
  import('~/pages/settings/account/ProfilePage').then((module) => ({
    default: module.SettingsProfilePage,
  })),
);

const SettingsChangePassword = lazy(() =>
  import('~/pages/settings/account/ChangePasswordPage').then((module) => ({
    default: module.ChangePasswordPage,
  })),
);

const SettingsFileUpload = lazy(() =>
  import('~/pages/settings/workspace/FilePage').then((module) => ({
    default: module.FilePage,
  })),
);
const SettingsMailConfig = lazy(() =>
  import('~/pages/settings/workspace/MailConfigPage').then((module) => ({
    default: module.MailConfigPage,
  })),
);
const GeneralSettings = lazy(() =>
  import('~/pages/settings/workspace/GeneralSettingsPage').then((module) => ({
    default: module.GeneralSettingsPage,
  })),
);

const TagsPage = lazy(() =>
  import('~/pages/settings/workspace/tags/TagsPage').then((module) => ({
    default: module.TagsPage,
  })),
);

const AppsSettings = lazy(() =>
  import('~/pages/settings/workspace/AppSettingsPage').then((module) => ({
    default: module.AppSettingsPage,
  })),
);

const ProductsSettingsRoutes = lazy(() =>
  import('@/products/settings/components/ProductSettingsRoutes').then(
    (module) => ({
      default: module.ProductsSettingRoutes,
    }),
  ),
);
const BrandsSettingsRoutes = lazy(() =>
  import('~/pages/settings/workspace/BrandsPage').then((module) => ({
    default: module.BrandsPage,
  })),
);

const AutomationSettingsRoutes = lazy(() =>
  import('@/automations/components/settings/components/AutomationSettingsRoutes').then(
    (module) => ({
      default: module.AutomationSettingsRoutes,
    }),
  ),
);

const PropertiesSettingsRoutes = lazy(() =>
  import('@/properties/components/PropertiesRoutes').then((module) => ({
    default: module.PropertiesSettingsRoutes,
  })),
);

const LogsRoutes = lazy(() =>
  import('~/pages/settings/logs/LogsIndexPage').then((module) => ({
    default: module.LogsIndexPage,
  })),
);

const BroadcastSettings = lazy(() =>
  import('~/pages/settings/workspace/BroadcastSettingsPage').then((module) => ({
    default: module.BroadcastSettingsPage,
  })),
);

const SettingsNotificationRoutes = lazy(() =>
  import('@/notification/settings/components/NotificationSettingsRoutes').then(
    (module) => ({
      default: module.NotificationSettingsRoutes,
    }),
  ),
);

export function SettingsRoutes() {
  const isOs = useVersion();

  return (
    <Suspense fallback={<Skeleton />}>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={`${SettingsPath.Profile}`} replace />}
        />
        <Route path={SettingsPath.Profile} element={<SettingsProfile />} />
        <Route
          path={SettingsPath.NotificationCatchAll}
          element={<SettingsNotificationRoutes />}
        />
        <Route
          path={SettingsPath.ChangePassword}
          element={<SettingsChangePassword />}
        />
        {/* <Route
          path={SettingsPath.Experience}
          element={<SettingsExperiencePage />}
        /> */}
        {isOs && (
          <Route
            path={SettingsWorkspacePath.FileUpload}
            element={<SettingsFileUpload />}
          />
        )}
        {isOs && (
          <Route
            path={SettingsWorkspacePath.MailConfig}
            element={<SettingsMailConfig />}
          />
        )}
        <Route
          path={SettingsWorkspacePath.General}
          element={<GeneralSettings />}
        />
        <Route
          path={SettingsWorkspacePath.TeamMemberCatchAll}
          element={<TeamMemberSettingsRoutes />}
        />

        <Route
          path={SettingsWorkspacePath.ClientPortals}
          element={<ClientPortalPage />}
        />
        <Route
          path={`${SettingsWorkspacePath.ClientPortals}/:clientPortalId`}
          element={<ClientPortalDetailPage />}
        />
        <Route path={SettingsWorkspacePath.Logs} element={<LogsRoutes />} />
        {/* <Route
          path={SettingsWorkspacePath.StructureCatchAll}
          element={<StructureSettings />}
        /> */}
        <Route path={SettingsWorkspacePath.Tags} element={<TagsPage />} />
        <Route
          path={SettingsWorkspacePath.Brands}
          element={<BrandsSettingsRoutes />}
        />
        <Route
          path={SettingsWorkspacePath.ProductsCatchAll}
          element={<ProductsSettingsRoutes />}
        />
        <Route
          path={SettingsWorkspacePath.AutomationsCatchAll}
          element={<AutomationSettingsRoutes />}
        />

        <Route path={SettingsWorkspacePath.Apps} element={<AppsSettings />} />
        <Route
          path={SettingsWorkspacePath.PropertiesCatchAll}
          element={<PropertiesSettingsRoutes />}
        />

        <Route
          path={SettingsWorkspacePath.Broadcast}
          element={<BroadcastSettings />}
        />
        {getPluginsSettingsRoutes()}
      </Routes>
      <SettingsPageEffect />
    </Suspense>
  );
}
