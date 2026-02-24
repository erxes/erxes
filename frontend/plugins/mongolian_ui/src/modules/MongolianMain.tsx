import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CheckCategoryPage } from '~/pages/CheckCategoryPage';
import { CheckPosOrdersPage } from '~/pages/CheckPosOrdersPage';
import { CheckProductsPage } from '~/pages/CheckProductsPage';
import { CheckSyncedDealsPage } from '~/pages/CheckSyncedDealsPage';
import { ByDatePage } from '~/pages/PutResponseByDatePage';
import { DuplicatedPage } from '~/pages/PutResponseDuplicatedPage';
import { PutResponseIndexPage } from '~/pages/PutResponsePage';
import { SyncErkhetHistoryPage } from '~/pages/SyncErkhetHistoryPage';
import { CustomersPage } from '~/pages/msdynamic/CustomersPage';
import { InventoryProductsPage } from '~/pages/msdynamic/InventoryProductsPage';
import { InventoryCategoryPage } from '~/pages/msdynamic/InventoryCategoryPage';
import { InventoryPricePage } from '~/pages/msdynamic/InventoryPricePage';
import { CheckSyncedOrdersPage } from '~/pages/msdynamic/CheckSyncedOrdersPage';
import { SyncHistoryListPage } from '~/pages/msdynamic/SyncHistoryPage';
import { PosOrderDetailsPage } from '~/pages/msdynamic/PosOrderDetailsPage';

const MongolianMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="put-response">
          <Route index element={<Navigate to="put-response" replace />} />
          <Route path="put-response" element={<PutResponseIndexPage />} />
          <Route path="by-date" element={<ByDatePage />} />
          <Route path="duplicated" element={<DuplicatedPage />} />
        </Route>
        <Route path="sync-erkhet">
          <Route index element={<Navigate to="history" replace />} />
          <Route path="history" element={<SyncErkhetHistoryPage />} />
          <Route path="deals" element={<CheckSyncedDealsPage />} />
          <Route path="products" element={<CheckProductsPage />} />
          <Route path="category" element={<CheckCategoryPage />} />
          <Route path="pos-order" element={<CheckPosOrdersPage />}></Route>
        </Route>
        <Route path="msdynamic">
  <Route index element={<Navigate to="customers" replace />} />

  <Route path="customers" element={<CustomersPage />} />
  <Route path="products" element={<InventoryProductsPage />} />
  <Route path="category" element={<InventoryCategoryPage />} />
  <Route path="price" element={<InventoryPricePage />} />

  <Route path="synced-orders" element={<CheckSyncedOrdersPage />} />
  <Route path="synced-orders/:id" element={<PosOrderDetailsPage />} />

  <Route path="sync-history" element={<SyncHistoryListPage />} />
</Route>
      </Routes>
    </Suspense>
  );
};

export default MongolianMain;
