import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EBarimtSettings from '@/ebarimt/settings/components/EBarimtSettings';
import ProductPlacesSettings from '@/productplaces/components/ProductPlacesSettings';
import ErkhetSettings from '@/erkhet-sync/settings/components/ErkhetSettings';

const MongolianSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="ebarimt/*" element={<EBarimtSettings />} />
        <Route path="sync-erkhet/*" element={<ErkhetSettings />} />
        <Route path="product-places/*" element={<ProductPlacesSettings />} />
        <Route index element={<Navigate to="ebarimt" replace />} />
      </Routes>
    </Suspense>
  );
};

export default MongolianSettings;
