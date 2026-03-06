import { Routes, Route, Navigate } from 'react-router-dom';
import { SettingsLayout } from '~/modules/SettingsLayout';
import ProductPlacesSidebar from '~/modules/productplaces/components/Sidebar';

import StagePage from '../../../pages/productplaces/StagePage';
import SplitPage from '../../../pages/productplaces/SplitPage';
import PrintPage from '../../../pages/productplaces/PrintPage';
import ProductFilterPage from '../../../pages/productplaces/ProductFilterPage';

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
