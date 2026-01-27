import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EBarimtSettings from '@/ebarimt/settings/components/EBarimtSettings';
import ProductPlacesSettings from '~/pages/productplaces/ProductPlacesSettings';
import PrintPage from '~/pages/productplaces/PrintPage';
import ProductFilterPage from '~/pages/productplaces/ProductFilterPage';
import SplitPage from '~/pages/productplaces/SplitPage';
import StagePage from '~/pages/productplaces/StagePage';

const MongolianSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        {/* Ebarimt */}
        <Route path="ebarimt/*" element={<EBarimtSettings />} />
        {/* Product Places */}
        <Route path="product-places/*" element={<ProductPlacesSettings />}>
        </Route>
        {/* default */}
        <Route index element={<Navigate to="ebarimt" replace />} />
      </Routes>
    </Suspense>
  );
};

export default MongolianSettings;
