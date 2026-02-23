import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsLayout } from '~/modules/SettingsLayout';
import ProductPlacesSidebar from '~/modules/productplaces/components/Sidebar';

import StagePage from './StagePage';
import SplitPage from './SplitPage';
import PrintPage from './PrintPage';
import ProductFilterPage from './ProductFilterPage'; // 👈 MUST EXIST

const ProductPlacesSettings = () => {
  return (
    <SettingsLayout sidebar={<ProductPlacesSidebar />}>
      <Routes>
        <Route index element={<Navigate to="stage" replace />} />
        <Route path="stage" element={<StagePage />} />
        <Route path="split" element={<SplitPage />} />
        <Route path="print" element={<PrintPage />} />
        <Route path="product-filter" element={<ProductFilterPage />} />
      </Routes>
    </SettingsLayout>
  );
};

export default ProductPlacesSettings;
