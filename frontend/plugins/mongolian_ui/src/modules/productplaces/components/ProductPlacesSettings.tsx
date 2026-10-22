import { Routes, Route, Navigate } from 'react-router-dom';

import StagePage from '../../../pages/productplaces/StagePage';
import SplitPage from '../../../pages/productplaces/SplitPage';
import PrintPage from '../../../pages/productplaces/PrintPage';
import ProductFilterPage from '../../../pages/productplaces/ProductFilterPage';

const ProductPlacesSettings = () => {
  return (
    <div className="flex h-full min-h-0 min-w-0 flex-auto flex-col overflow-hidden">
      <Routes>
        <Route index element={<Navigate to="stage" replace />} />
        <Route path="stage" element={<StagePage />} />
        <Route path="split" element={<SplitPage />} />
        <Route path="print" element={<PrintPage />} />
        <Route path="product-filter" element={<ProductFilterPage />} />
      </Routes>
    </div>
  );
};

export default ProductPlacesSettings;
