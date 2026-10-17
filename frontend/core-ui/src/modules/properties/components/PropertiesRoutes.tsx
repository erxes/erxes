import { usePropertiesScope } from '@/properties/context/PropertiesScopeContext';
import { usePropertyTypes } from '@/properties/hooks/usePropertyTypes';
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

const PropertiesIndexRedirect = () => {
  const { basePath, pluginName } = usePropertiesScope();
  const { propertyTypes, loading } = usePropertyTypes();

  if (!pluginName) {
    return <Navigate to={`${basePath}/core:customer`} replace />;
  }

  const [firstType] = propertyTypes[pluginName] || [];

  if (loading && !firstType) {
    return <Spinner />;
  }

  if (!firstType) {
    return <Navigate to=".." replace />;
  }

  return <Navigate to={`${basePath}/${firstType.contentType}`} replace />;
};

export const PropertiesSettingsRoutes = () => {
  return (
    <Suspense fallback={<Spinner />}>
      <Routes>
        <Route index element={<PropertiesIndexRedirect />} />
        <Route
          path="/:type/*"
          element={
            <PageContainer>
              <PropertiesHeader />
              <PropertiesLayout>
                <PropertiesSettingsPage />
                <Routes>
                  <Route path="/add" element={<AddPropertyFieldPage />} />
                  <Route
                    path="/:groupId/add"
                    element={<AddPropertyFieldPage />}
                  />
                  <Route
                    path="/:groupId/:id"
                    element={<EditPropertyFieldPage />}
                  />
                </Routes>
              </PropertiesLayout>
            </PageContainer>
          }
        />
      </Routes>
    </Suspense>
  );
};
