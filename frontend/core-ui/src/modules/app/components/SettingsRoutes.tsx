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
// const GeneralSettings = lazy(() =>
//   import('~/pages/settings/workspace/GeneralSettingsPage').then((module) => ({
//     default: module.GeneralSettingsPage,
//   })),
// );
const TeamMemberSettings = lazy(() =>
  import('~/pages/settings/workspace/TeamMemberPage').then((module) => ({
    default: module.TeamMemberPage,
  })),
);
const PermissionsSettings = lazy(() =>
  import('~/pages/settings/workspace/PermissionPage').then((module) => ({
    default: module.PermissionPage,
  })),
);
// const StructureSettings = lazy(() =>
//   import('~/pages/settings/workspace/structure/StructureSettingsPage').then(
//     (module) => ({
//       default: module.StructureSettingsPage,
//     }),
//   ),
// );

const TagsSettings = lazy(() =>
  import('~/pages/settings/workspace/tags/TagsSettingPage').then((module) => ({
    default: module.TagsSettingPage,
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
  import(
    '@/automations/components/settings/components/AutomationSettingsRoutes'
  ).then((module) => ({
    default: module.AutomationSettingsRoutes,
  })),
);

const PropertiesSettins = lazy(() =>
  import('~/pages/settings/workspace/PropertiesSettingsPage').then(
    (module) => ({
      default: module.PropertiesSettingsPage,
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
          path={SettingsPath.ChangePassword}
          element={<SettingsChangePassword />}
        />
        {/* <Route
          path={SettingsPath.Experience}
          element={<SettingsExperiencePage />}
        /> */}
        <Route
          path={SettingsWorkspacePath.FileUpload}
          element={<SettingsFileUpload />}
        />
        <Route
          path={SettingsWorkspacePath.MailConfig}
          element={<SettingsMailConfig />}
        />
        {/* <Route
          path={SettingsWorkspacePath.General}
          element={<GeneralSettings />}
        /> */}
        <Route
          path={SettingsWorkspacePath.TeamMember}
          element={<TeamMemberSettings />}
        />
        <Route
          path={SettingsWorkspacePath.Permissions}
          element={<PermissionsSettings />}
        />
        {/* <Route
          path={SettingsWorkspacePath.StructureCatchAll}
          element={<StructureSettings />}
        /> */}
        <Route path={SettingsWorkspacePath.Tags} element={<TagsSettings />} />
        <Route
          path={SettingsWorkspacePath.Brands}
          element={<BrandsSettingsRoutes />}
        />
        {isOs && (
          <Route
            path={SettingsWorkspacePath.ProductsCatchAll}
            element={<ProductsSettingsRoutes />}
          />
        )}
        {isOs && (
          <Route
            path={SettingsWorkspacePath.AutomationsCatchAll}
            element={<AutomationSettingsRoutes />}
          />
        )}

        <Route path={SettingsWorkspacePath.Apps} element={<AppsSettings />} />
        <Route
          path={SettingsWorkspacePath.Properties}
          element={<PropertiesSettins />}
        />
        {getPluginsSettingsRoutes()}
      </Routes>
      <SettingsPageEffect />
    </Suspense>
  );
}
