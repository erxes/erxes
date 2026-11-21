import { IconCategory, IconHierarchy2 } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppSettingsLayout } from '~/components/AppSettingsLayout';
import { paths } from '~/lib/paths';
import { CategoriesPage } from './CategoriesPage';

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
          name: sidebarT('data-fields', 'Fields'),
          to: paths.settings.dataFieldsOf('core.product'),
          icon: IconHierarchy2,
        },
      ]}
    />
  );
};

/** Everything under `/products/settings/*`: categories; product fields are in the Data model. */
export const ProductsSettingsRoutes = () => (
  <Routes>
    <Route element={<ProductsSettingsLayout />}>
      <Route index element={<Navigate to={paths.products.categories} replace />} />
      <Route path="categories" element={<CategoriesPage />} />
      <Route path="*" element={<Navigate to={paths.products.categories} replace />} />
    </Route>
  </Routes>
);
