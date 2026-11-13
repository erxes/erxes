import type { FieldContentType } from '@erxes/core-contract';
import { IconsProvider, PageContainer } from 'erxes-ui';
import type { ReactNode } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import { PropertiesHeader } from '~/modules/properties/components/PropertiesHeader';
import { PropertiesLayout } from '~/modules/properties/components/PropertiesLayout';
import { PropertyAdd } from '~/modules/properties/components/PropertyAdd';
import { PropertyEdit } from '~/modules/properties/components/PropertyEdit';
import { PropertyFieldsGroupSettings } from '~/modules/properties/components/PropertyFieldsGroupSettings';
import { isPropertyType, propertiesPath } from '~/modules/properties/constants';
import { useCanManageFields } from '~/modules/properties/usePropertyMutations';

type Types = readonly [FieldContentType, ...FieldContentType[]];

/** Pages of one record type; unknown types go back to the first one. */
const PropertiesTypeRoutes = ({ types }: { types: Types }) => {
  const { type } = useParams<{ type: string }>();
  const manager = useCanManageFields();

  if (!isPropertyType(types, type)) {
    return <Navigate to={propertiesPath(types[0])} replace />;
  }

  const list = propertiesPath(type);
  const managerOnly = (element: ReactNode) => (manager ? element : <Navigate to={list} replace />);

  return (
    <PageContainer>
      <PropertiesLayout types={types} header={<PropertiesHeader contentType={type} />}>
        <Routes>
          <Route index element={<PropertyFieldsGroupSettings key={type} contentType={type} />} />
          <Route path="add" element={managerOnly(<PropertyAdd contentType={type} />)} />
          <Route path=":groupId/add" element={managerOnly(<PropertyAdd contentType={type} />)} />
          <Route path=":groupId/:id" element={managerOnly(<PropertyEdit contentType={type} />)} />
          <Route path="*" element={<Navigate to={list} replace />} />
        </Routes>
      </PropertiesLayout>
    </PageContainer>
  );
};

/**
 * An app's Settings › Properties for its record types (Contacts: customers and
 * companies; Products: products): `<base>/:type` lists a type's groups and
 * fields; `:type/add`, `:type/:groupId/add` and `:type/:groupId/:id` are the
 * add and edit pages.
 */
export const PropertiesSettingsRoutes = ({ types }: { types: Types }) => (
  <IconsProvider>
    <Routes>
      <Route index element={<Navigate to={propertiesPath(types[0])} replace />} />
      <Route path=":type/*" element={<PropertiesTypeRoutes types={types} />} />
    </Routes>
  </IconsProvider>
);
