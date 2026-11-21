import { IconsProvider } from 'erxes-ui';
import { Navigate, Route, Routes } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { useCanManageDataModel } from '../dataQueries';
import { FieldsPage } from './FieldsPage';
import { ObjectsPage } from './ObjectsPage';
import { PluginsPage } from './PluginsPage';

/**
 * Settings › Data model, for members who shape it (`properties.manage`): `objects`,
 * `fields/<record type>` and `plugins`.
 */
export const DataModelRoutes = () => {
  if (!useCanManageDataModel()) return <Navigate to={paths.settings.root} replace />;

  return (
    <IconsProvider>
      <Routes>
        <Route index element={<Navigate to={paths.settings.dataObjects} replace />} />
        <Route path="objects" element={<ObjectsPage />} />
        <Route path="fields" element={<FieldsPage />} />
        <Route path="fields/:recordType" element={<FieldsPage />} />
        <Route path="plugins" element={<PluginsPage />} />
        <Route path="*" element={<Navigate to={paths.settings.dataObjects} replace />} />
      </Routes>
    </IconsProvider>
  );
};
