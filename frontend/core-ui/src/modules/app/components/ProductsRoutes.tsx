import { lazy, Suspense } from 'react';
import { Route } from 'react-router';
import { Routes } from 'react-router';

import { ProductsPath } from '@/types/paths/ProductsPath';

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

export const ProductsRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route path={ProductsPath.Index} element={<ProductsIndexPage />} />
        <Route
          path={ProductsPath.Categories}
          element={<ProductsCategoryPage />}
        />
      </Routes>
    </Suspense>
  );
};
