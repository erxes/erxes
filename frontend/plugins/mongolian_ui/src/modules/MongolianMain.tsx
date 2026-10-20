import { PluginSettingsRoutes } from 'ui-modules';
import { Suspense, lazy } from 'react';
import { AppLayout, Spinner } from 'erxes-ui';
import {
  MongolianSidebar,
  MongolianSidebarFooter,
  MongolianSettingsLayout,
} from '~/Sidebar';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CheckCategoryPage } from '~/pages/CheckCategoryPage';
import { CheckPosOrdersPage } from '~/pages/CheckPosOrdersPage';
import { CheckProductsPage } from '~/pages/CheckProductsPage';
import { CheckSyncedDealsPage } from '~/pages/CheckSyncedDealsPage';
import { ByDatePage } from '~/pages/PutResponseByDatePage';
import { DuplicatedPage } from '~/pages/PutResponseDuplicatedPage';
import { PutResponseIndexPage } from '~/pages/PutResponsePage';
import { PutResponseLayout } from '~/pages/PutResponseLayout';
import { SyncErkhetHistoryPage } from '~/pages/SyncErkhetHistoryPage';
import { SyncErkhetLayout } from '~/pages/SyncErkhetLayout';
import { CustomersPage } from '~/pages/msdynamic/CustomersPage';
import { InventoryProductsPage } from '~/pages/msdynamic/InventoryProductsPage';
import { InventoryCategoryPage } from '~/pages/msdynamic/InventoryCategoryPage';
import { InventoryPricePage } from '~/pages/msdynamic/InventoryPricePage';
import { CheckSyncedOrdersPage } from '~/pages/msdynamic/CheckSyncedOrdersPage';
import { PosOrderDetailsPage } from '~/pages/msdynamic/PosOrderDetailsPage';
import MsdynamicLayout from '~/pages/msdynamic/MsdynamicLayout';
import { MSDynamicSyncHistoryPage } from '~/pages/msdynamic/MSDynamicSyncHistoryPage';

const MongolianMain = () => {
  return (
    <AppLayout
      id="mongolian"
      title="Mongolian"
      sidebar={<MongolianSidebar />}
      footer={<MongolianSidebarFooter />}
    >
      <Suspense fallback={<div />}>
        <Routes>
          {/* PUT RESPONSE */}
          <Route path="put-response" element={<PutResponseLayout />}>
            <Route index element={<Navigate to="put-response" replace />} />
            <Route path="put-response" element={<PutResponseIndexPage />} />
            <Route path="by-date" element={<ByDatePage />} />
            <Route path="duplicated" element={<DuplicatedPage />} />
          </Route>

          {/* ERKHET */}
          <Route path="sync-erkhet" element={<SyncErkhetLayout />}>
            <Route index element={<Navigate to="history" replace />} />
            <Route path="history" element={<SyncErkhetHistoryPage />} />
            <Route path="deals" element={<CheckSyncedDealsPage />} />
            <Route path="products" element={<CheckProductsPage />} />
            <Route path="category" element={<CheckCategoryPage />} />
            <Route path="pos-order" element={<CheckPosOrdersPage />} />
          </Route>

          {/* MSDYNAMIC */}
          <Route path="msdynamic" element={<MsdynamicLayout />}>
            <Route index element={<Navigate to="sync-history" replace />} />
            <Route path="sync-history" element={<MSDynamicSyncHistoryPage />} />
            <Route path="synced-orders" element={<CheckSyncedOrdersPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="products" element={<InventoryProductsPage />} />
            <Route path="categories" element={<InventoryCategoryPage />} />
            <Route path="prices" element={<InventoryPricePage />} />

            <Route
              path="pos-order-detail/:id"
              element={<PosOrderDetailsPage />}
            />
          </Route>
        </Routes>
      </Suspense>
    </AppLayout>
  );
};

const MongolianSettingsRoutes = lazy(
  () => import('~/modules/MongolianSettings'),
);
// JSX needs a capitalised name.
const MongolianAppRoutes = MongolianMain;

/** The plugin owns its settings too: `/mongolian/settings/*` has its own sidebar. */
const MongolianEntry = () => (
  <Routes>
    <Route
      path="settings/*"
      element={
        <MongolianSettingsLayout>
          <Suspense fallback={<Spinner />}>
            <PluginSettingsRoutes
              pluginName="mongolian"
              basePath="/mongolian/settings"
            >
              <MongolianSettingsRoutes />
            </PluginSettingsRoutes>
          </Suspense>
        </MongolianSettingsLayout>
      }
    />
    <Route path="*" element={<MongolianAppRoutes />} />
  </Routes>
);

export default MongolianEntry;
