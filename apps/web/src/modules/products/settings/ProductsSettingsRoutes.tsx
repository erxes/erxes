import { IconCategory, IconHierarchy2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppSettingsLayout } from '~/components/AppSettingsLayout';
import { PropertiesSettingsRoutes } from '~/modules/settings/properties/PropertiesSettingsRoutes';
import { paths } from '~/lib/paths';
import { CategoriesPage } from './CategoriesPage';

const PRODUCT_PROPERTY_TYPES = ['product'] as const;

/** Products › Settings, as Contacts keeps its own: "Exit settings" goes back to the catalog. */
const ProductsSettingsLayout = () => {
  const { t } = useTranslation('product');
  const { t: sidebarT } = useTranslation('common', { keyPrefix: 'sidebar' });

  return (
    <AppSettingsLayout
      id="products-settings"
      title={t('settings.title', 'Products settings')}
      exitTo={paths.products.list}
      items={[
        {
          name: t('settings.categories', 'Categories'),
          to: paths.products.categories,
          icon: IconCategory,
        },
        {
          name: sidebarT('properties', 'Properties'),
          to: paths.products.properties,
          icon: IconHierarchy2,
        },
      ]}
    />
  );
};

/** Everything under `/products/settings/*`: categories and product properties. */
export const ProductsSettingsRoutes = () => (
  <Routes>
    <Route element={<ProductsSettingsLayout />}>
      <Route index element={<Navigate to={paths.products.categories} replace />} />
      <Route path="categories" element={<CategoriesPage />} />
      <Route
        path="properties/*"
        element={<PropertiesSettingsRoutes types={PRODUCT_PROPERTY_TYPES} />}
      />
      <Route path="*" element={<Navigate to={paths.products.categories} replace />} />
    </Route>
  </Routes>
);
