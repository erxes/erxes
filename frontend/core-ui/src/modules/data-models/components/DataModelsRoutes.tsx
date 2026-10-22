import { Route, Routes } from 'react-router-dom';
import { DataModelCatalog } from './DataModelCatalog';
import { DataModelDetail } from './DataModelDetail';

export const DataModelsRoutes = () => (
  <Routes>
    <Route index element={<DataModelCatalog />} />
    <Route path=":modelId" element={<DataModelDetail />} />
  </Routes>
);
