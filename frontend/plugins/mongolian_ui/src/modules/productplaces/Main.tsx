// frontend/plugins/mongolian_ui/src/modules/productplaces/Main.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProductPlacesSettings from '../../pages/productplaces/ProductPlacesSettings';
import StagePage from '../../pages/productplaces/StagePage';
import SplitPage from '../../pages/productplaces/SplitPage';
import PrintPage from '../../pages/productplaces/PrintPage';
import ProductFilterPage from '../../pages/productplaces/ProductFilterPage';

const Main = () => {
  console.log('ProductPlaces Main rendering');
  
  return (
    <div className="h-full">
      <Routes>
        <Route path="/" element={<ProductPlacesSettings />}>
          <Route index element={<Navigate to="stage" replace />} />
          <Route path="stage" element={<StagePage />} />
          <Route path="split" element={<SplitPage />} />
          <Route path="print" element={<PrintPage />} />
          <Route path="product-filter" element={<ProductFilterPage />} />
        </Route>
      </Routes>
    </div>
  );
};

export default Main;