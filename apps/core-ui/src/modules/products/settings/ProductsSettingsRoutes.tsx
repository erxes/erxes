import { IconCategory, IconChevronLeft, IconHierarchy2 } from '@tabler/icons-react';
import { AppLayout, NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import { PageOutlet } from '~/components/CrashBoundary';
import { PropertiesSettingsRoutes } from '~/modules/settings/properties/PropertiesSettingsRoutes';
import { PRODUCTS_PATH } from '../paths';
import { CategoriesPage } from './CategoriesPage';

const PRODUCT_PROPERTY_TYPES = ['product'] as const;

/** Products › Settings, as Contacts keeps its own: "Exit settings" goes back to the catalog. */
const ProductsSettingsSidebar = () => {
  const { t } = useTranslation('product');
  const { t: sidebarT } = useTranslation('common', { keyPrefix: 'sidebar' });

  const items = [
    { name: t('settings.categories', 'Categories'), path: 'categories', icon: IconCategory },
    { name: sidebarT('properties', 'Properties'), path: 'properties', icon: IconHierarchy2 },
  ];

  return (
    <>
      <Sidebar.Header className="px-2 pt-0 pb-1">
        <Sidebar.Menu>
          <Sidebar.MenuItem>
            <Sidebar.MenuButton render={<Link to={PRODUCTS_PATH} />}>
              <IconChevronLeft />
              <span>{sidebarT('exit-settings', 'Exit settings')}</span>
            </Sidebar.MenuButton>
          </Sidebar.MenuItem>
        </Sidebar.Menu>
      </Sidebar.Header>
      <Sidebar.Content className="styled-scroll gap-1">
        <Sidebar.Group>
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {items.map((item) => (
                <NavigationMenuLinkItem
                  key={item.path}
                  pathPrefix="products/settings"
                  path={item.path}
                  name={item.name}
                  icon={item.icon}
                />
              ))}
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      </Sidebar.Content>
    </>
  );
};

const ProductsSettingsLayout = () => {
  const { t } = useTranslation('product');

  return (
    <AppLayout
      id="products-settings"
      title={t('settings.title', 'Products settings')}
      sidebar={<ProductsSettingsSidebar />}
    >
      <PageOutlet />
    </AppLayout>
  );
};

/** Everything under `/products/settings/*`: categories and product properties. */
export const ProductsSettingsRoutes = () => (
  <Routes>
    <Route element={<ProductsSettingsLayout />}>
      <Route index element={<Navigate to="categories" replace />} />
      <Route path="categories" element={<CategoriesPage />} />
      <Route
        path="properties/*"
        element={<PropertiesSettingsRoutes types={PRODUCT_PROPERTY_TYPES} />}
      />
      <Route path="*" element={<Navigate to="categories" replace />} />
    </Route>
  </Routes>
);
