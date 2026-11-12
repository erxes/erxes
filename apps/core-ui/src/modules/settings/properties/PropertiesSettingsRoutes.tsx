import { IconsProvider, PageContainer } from 'erxes-ui';
import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { PropertiesHeader } from '~/modules/properties/components/PropertiesHeader';
import { PropertiesLayout } from '~/modules/properties/components/PropertiesLayout';
import { PropertyAdd } from '~/modules/properties/components/PropertyAdd';
import { PropertyEdit } from '~/modules/properties/components/PropertyEdit';
import { PropertyFieldsGroupSettings } from '~/modules/properties/components/PropertyFieldsGroupSettings';
import {
  isPropertyType,
  PROPERTIES_BASE_PATH,
  PROPERTY_TYPES,
} from '~/modules/properties/constants';
import { useCanManageFields } from '~/modules/properties/usePropertyMutations';

/** Pages of one record type; unknown types go back to the first one. */
const PropertiesTypeRoutes = () => {
  const { type } = useParams<{ type: string }>();
  const manager = useCanManageFields();

  if (!isPropertyType(type)) {
    return <Navigate to={PROPERTIES_BASE_PATH} replace />;
  }

  const managerOnly = (element: ReactNode) =>
    manager ? element : <Navigate to={`${PROPERTIES_BASE_PATH}/${type}`} replace />;

  return (
    <PageContainer>
      <PropertiesLayout header={<PropertiesHeader />}>
        <Routes>
          <Route index element={<PropertyFieldsGroupSettings key={type} contentType={type} />} />
          <Route path="add" element={managerOnly(<PropertyAdd contentType={type} />)} />
          <Route path=":groupId/add" element={managerOnly(<PropertyAdd contentType={type} />)} />
          <Route path=":groupId/:id" element={managerOnly(<PropertyEdit contentType={type} />)} />
          <Route path="*" element={<Navigate to={`${PROPERTIES_BASE_PATH}/${type}`} replace />} />
        </Routes>
      </PropertiesLayout>
    </PageContainer>
  );
};

/**
 * Contacts › Settings › Properties: `/contacts/settings/properties/:type`
 * lists a record type's groups and fields; `:type/add`, `:type/:groupId/add` and
 * `:type/:groupId/:id` are the add and edit pages.
 */
export const PropertiesSettingsRoutes = () => (
  <IconsProvider>
    <Routes>
      <Route
        index
        element={
          <Navigate to={`${PROPERTIES_BASE_PATH}/${PROPERTY_TYPES[0].contentType}`} replace />
        }
      />
      <Route path=":type/*" element={<PropertiesTypeRoutes />} />
    </Routes>
  </IconsProvider>
);
