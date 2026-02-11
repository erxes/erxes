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

const ProductsUomPage = lazy(() =>
  import('~/pages/products/ProductsUomPage').then((module) => ({
    default: module.ProductUomPage,
  })),
);

const ProductsGeneralConfigPage = lazy(() =>
  import('~/pages/products/ProductsGeneralConfigPage').then((module) => ({
    default: module.ProductsGeneralConfigPage,
  })),
);

const ProductsSimilarityGroupPage = lazy(() =>
  import('~/pages/products/ProductsSimilarityGroupPage').then((module) => ({
    default: module.ProductsSimilarityGroupPage,
  })),
);

const ProductsBundleConditionPage = lazy(() =>
  import('~/pages/products/ProductsBundleConditionPage').then((module) => ({
    default: module.ProductsBundleConditionPage,
  })),
);

const ProductsBundleRulePage = lazy(() =>
  import('~/pages/products/ProductsBundleRulePage').then((module) => ({
    default: module.ProductsBundleRulePage,
  })),
);

const ProductsProductRulePage = lazy(() =>
  import('~/pages/products/ProductsProductRulePage').then((module) => ({
    default: module.ProductsProductRulePage,
  })),
);

export const ProductsSettingRoutes = () => {
  return (
    <Suspense fallback={<></>}>
      <Routes>
        <Route index element={<ProductsIndexPage />} />
        <Route path="categories" element={<ProductsCategoryPage />} />
        <Route path="uoms" element={<ProductsUomPage />} />
        <Route path="general-config" element={<ProductsGeneralConfigPage />} />
        <Route
          path="similarity-group"
          element={<ProductsSimilarityGroupPage />}
        />
        <Route
          path="bundle-condition"
          element={<ProductsBundleConditionPage />}
        />
        <Route path="bundle-rule" element={<ProductsBundleRulePage />} />
        <Route path="product-rule" element={<ProductsProductRulePage />} />
      </Routes>
      <ProductsPageEffect />
    </Suspense>
  );
};
