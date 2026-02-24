import { ProductsPageEffect } from '@/products/ProductsPageEffect';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const ProductsIndexPage = lazy(() =>
  import('~/pages/products/ProductsIndexPage').then((module) => ({
    default: module.ProductsIndexPage,
  })),
);

const ProductsCategoryPage = lazy(() =>
  import('~/pages/products/ProductCategoryPage').then((module) => ({
    default: module.ProductCategoryPage,
  })),
);

const ProductsGeneralSettings = lazy(() =>
  import('~/pages/products/ProductsUomPage').then((module) => ({
    default: module.ProductUomPage,
  })),
);

export const ProductsSettingRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route index element={<ProductsIndexPage />} />
        <Route path="/categories" element={<ProductsCategoryPage />} />
        <Route path="/uoms" element={<ProductsGeneralSettings />} />
      </Routes>
      <ProductsPageEffect />
    </Suspense>
  );
};
