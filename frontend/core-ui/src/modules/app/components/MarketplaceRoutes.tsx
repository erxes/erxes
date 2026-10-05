import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const MarketplacePage = lazy(() =>
  import('~/pages/marketplace/MarketplacePage').then((module) => ({
    default: module.MarketplacePage,
  })),
);

export const MarketplaceRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route path="/" element={<MarketplacePage />} />
      </Routes>
    </Suspense>
  );
};
