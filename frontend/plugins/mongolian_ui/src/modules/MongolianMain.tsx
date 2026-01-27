import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CheckCategoryPage } from '~/pages/CheckCategoryPage';
import { CheckPosOrdersPage } from '~/pages/CheckPosOrdersPage';
import { CheckProductsPage } from '~/pages/CheckProductsPage';
import { CheckSyncedDealsPage } from '~/pages/CheckSyncedDealsPage';
import PrintPage from '~/pages/productplaces/PrintPage';
import ProductFilterPage from '~/pages/productplaces/ProductFilterPage';
import ProductPlacesSettings from '~/pages/productplaces/ProductPlacesSettings';
import SplitPage from '~/pages/productplaces/SplitPage';
import StagePage from '~/pages/productplaces/StagePage';
import { ByDatePage } from '~/pages/PutResponseByDatePage';
import { DuplicatedPage } from '~/pages/PutResponseDuplicatedPage';
import { PutResponseIndexPage } from '~/pages/PutResponsePage';
import { SyncErkhetHistoryPage } from '~/pages/SyncErkhetHistoryPage';
const MongolianMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>
        <Route path="product-places" element={<ProductPlacesSettings />}>
          <Route index element={<Navigate to="stage" replace />} />
          <Route path="stage" element={<StagePage />} />
          <Route path="split" element={<SplitPage />} />
          <Route path="print" element={<PrintPage />} />
          <Route path="product-filter" element={<ProductFilterPage />} />
        </Route>
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
      </Routes>
    </Suspense>
  );
};

export default MongolianMain;
