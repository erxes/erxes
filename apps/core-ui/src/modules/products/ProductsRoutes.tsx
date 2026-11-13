import { IconPackage, IconSettings } from '@tabler/icons-react';
import { AppLayout, AppLayoutFooterLink, NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, Route, Routes } from 'react-router-dom';
import { ProductsPage } from './list/ProductsPage';
import { PRODUCT_SETTINGS_PATH } from './paths';
import { ProductsSettingsRoutes } from './settings/ProductsSettingsRoutes';

/** The Products app: its sidebar (the catalog, settings pinned at the foot) and the open page. */
const ProductsLayout = () => {
  const { t } = useTranslation('product');
  const { t: sidebarT } = useTranslation('common', { keyPrefix: 'sidebar' });

  return (
    <AppLayout
      id="products"
      title={t('products', 'Products')}
      footer={
        <AppLayoutFooterLink
          path={PRODUCT_SETTINGS_PATH}
          name={sidebarT('settings', 'Settings')}
          icon={IconSettings}
        />
      }
      sidebar={
        <Sidebar.Group className="px-2 py-1">
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              <NavigationMenuLinkItem
                pathPrefix="products"
                path=""
                name={t('catalog', 'Catalog')}
                icon={IconPackage}
              />
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      }
    >
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
    </AppLayout>
  );
};

/** Every Products route, mounted at `products/*`: the catalog and its settings. */
export const ProductsRoutes = ({ notFound }: { notFound?: ReactNode }) => (
  <Routes>
    <Route element={<ProductsLayout />}>
      <Route index element={<ProductsPage />} />
      {notFound && <Route path="*" element={notFound} />}
    </Route>
    <Route path="settings/*" element={<ProductsSettingsRoutes />} />
  </Routes>
);
