import { ProductsSettingsLayout } from '@/products/settings/components/ProductsSettingsLayout';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';

const ProductsGeneralSettings = lazy(() =>
  import('~/pages/settings/modules/ProductsSettingsGeneralPage').then(
    (module) => ({ default: module.ProductsSettingGeneralPage }),
  ),
);

const ProductsUomsSettings = lazy(() =>
  import('~/pages/settings/modules/ProductsSettingsUomsPage').then(
    (module) => ({ default: module.ProductsSettingsUomsPage }),
  ),
);

const ProductsSimilarityConfigSettings = lazy(() =>
  import('~/pages/settings/modules/ProductsSettingsSimilarityConfig').then(
    (module) => ({ default: module.ProductsSettingsSimilarityConfig }),
  ),
);

export const ProductsSettingRoutes = () => {
  return (
    <ProductsSettingsLayout>
      <Routes>
        <Route path="/" element={<ProductsGeneralSettings />} />
        <Route path="/uom" element={<ProductsUomsSettings />} />
        <Route
          path="/similarity-configs"
          element={<ProductsSimilarityConfigSettings />}
        />
      </Routes>
    </ProductsSettingsLayout>
  );
};
