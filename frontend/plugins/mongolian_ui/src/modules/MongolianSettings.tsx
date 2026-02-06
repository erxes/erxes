import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import EBarimtSettings from '@/ebarimt/settings/components/EBarimtSettings';
import ProductPlacesSettings from '~/pages/productplaces/ProductPlacesSettings';
import ErkhetSettings from '@/erkhet-sync/settings/components/ErkhetSettings';
import ExchangeRatesPage from '@/exchangeRates/Main';

const MongolianSettings = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        {/* Ebarimt */}
        <Route path="ebarimt/*" element={<EBarimtSettings />} />
        {/* Product Places */}
        <Route path="product-places/*" element={<ProductPlacesSettings />}>
          {/* Exchange Rates */}
          <Route path="exchange-rates/*" element={<ExchangeRatesPage />} />
        </Route>
        {/* default */}
        <Route index element={<Navigate to="ebarimt" replace />} />
      </Routes>
      <Routes>
        <Route path="sync-erkhet/*" element={<ErkhetSettings />} />
        <Route index element={<Navigate to="sync-erkhet" replace />} />
      </Routes>
      <Routes>
        <Route path="product-places/*" element={<ErkhetSettings />} />
        <Route index element={<Navigate to="sync-erkhet" replace />} />
      </Routes>
      <Routes>
    <Route path="exchange-rates/*" element={<ExchangeRatesPage />} />
    <Route index element={<Navigate to="exchange-rates" replace />} />
  </Routes>
    </Suspense>
  );
};

export default MongolianSettings;
