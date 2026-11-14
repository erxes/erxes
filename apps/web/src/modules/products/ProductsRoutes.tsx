import { IconPackage, IconSettings } from '@tabler/icons-react';
import { AppLayout, AppLayoutFooterLink, NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Route, Routes } from 'react-router-dom';
import { PageOutlet } from '~/components/CrashBoundary';
import { RecordPage } from '~/modules/side-panel/RecordPage';
import { NestedViews } from '~/modules/views/NestedViews';
import { ProductsPage } from './list/ProductsPage';
import { paths } from '~/lib/paths';
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
          to={paths.products.settings}
          name={sidebarT('settings', 'Settings')}
          icon={IconSettings}
        />
      }
      sidebar={
        <Sidebar.Group variant="flush">
          <Sidebar.GroupContent>
            <Sidebar.Menu>
              {/* The catalog's saved views nest under it. */}
              <NavigationMenuLinkItem
                to={paths.products.list}
                name={t('catalog', 'Catalog')}
                icon={IconPackage}
                action={<NestedViews recordType="product" />}
              />
            </Sidebar.Menu>
          </Sidebar.GroupContent>
        </Sidebar.Group>
      }
    >
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <PageOutlet />
      </div>
    </AppLayout>
  );
};

/**
 * Every Products route, mounted at `products/*`: the catalog, each product's
 * own page (where the side panel's expand button leads) and its settings.
 */
export const ProductsRoutes = ({ notFound }: { notFound?: ReactNode }) => (
  <Routes>
    <Route element={<ProductsLayout />}>
      <Route index element={<ProductsPage />} />
      <Route path=":id" element={<RecordPage contentType="core:product" />} />
      {notFound && <Route path="*" element={notFound} />}
    </Route>
    <Route path="settings/*" element={<ProductsSettingsRoutes />} />
  </Routes>
);
