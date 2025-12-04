import {
  SettingsPath,
  SettingsWorkspacePath,
} from '@/types/paths/SettingsPath';
import { PageContainer, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { PropertiesHeader } from './PropertiesHeader';
import { PropertiesLayout } from './PropertiesLayout';

const AddPropertyFieldPage = lazy(() =>
  import(
    '~/pages/settings/workspace/properties/PropertiesSettingsCreatePage'
  ).then((module) => ({
    default: module.PropertiesSettingsCreatePage,
  })),
);

const EditPropertyFieldPage = lazy(() =>
  import(
    '~/pages/settings/workspace/properties/PropertiesSettingsEditPage'
  ).then((module) => ({
    default: module.PropertiesSettingEditPage,
  })),
);

export const PropertiesSettingsPage = lazy(() =>
  import('~/pages/settings/workspace/properties/PropertiesSettingsPage').then(
    (module) => ({
      default: module.PropertiesSettingsPage,
    }),
  ),
);

export const PropertiesSettingsRoutes = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <PageContainer>
        <PropertiesHeader />

        <Routes>
          <Route element={<PropertiesLayout />}>
            <Route
              index
              element={
                <Navigate
                  to={`/${SettingsPath.Index}${SettingsWorkspacePath.Properties}/core:customer`}
                  replace
                />
              }
            />
            <Route path="/:type" element={<PropertiesSettingsPage />} />
            <Route
              path="/:type/:groupId/add"
              element={<AddPropertyFieldPage />}
            />
            <Route path="/:type/:id" element={<EditPropertyFieldPage />} />
          </Route>
        </Routes>
      </PageContainer>
    </Suspense>
  );
};
