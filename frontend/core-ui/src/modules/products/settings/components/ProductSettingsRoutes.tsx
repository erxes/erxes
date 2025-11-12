import { ProductsSettingsLayout } from '@/products/settings/components/ProductsSettingsLayout';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const ProductsGeneralSettings = lazy(() =>
  import('~/pages/settings/modules/ProductsSettingsGeneralPage').then(
    (module) => ({ default: module.ProductsSettingGeneralPage }),
  ),
);

export const ProductsSettingRoutes = () => {
  return (
    <ProductsSettingsLayout>
      <Routes>
        <Route index element={<ProductsGeneralSettings />} />
      </Routes>
    </ProductsSettingsLayout>
  );
};
