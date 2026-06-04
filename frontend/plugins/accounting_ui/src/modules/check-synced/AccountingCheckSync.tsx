import { Filter, Spinner } from 'erxes-ui';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { AccTrCheckSidebar } from '~/modules/check-synced/components/Sidebar';

const AccountingCheckSyncedDealsPage = lazy(() =>
  import(
    '~/modules/check-synced/deals/components/AccountingCheckSyncedDealsPage'
  ).then((module) => ({
    default: module.AccountingCheckSyncedDealsPage,
  })),
);

const AccountingCheckSyncedOrdersPage = lazy(() =>
  import(
    '~/modules/check-synced/orders/components/AccountingCheckSyncedOrdersPage'
  ).then((module) => ({
    default: module.AccountingCheckSyncedOrdersPage,
  })),
);

export const AccountingCheckSync = () => {
  return (
    <Filter id="accounting-check-sync">
      <div className="flex flex-col flex-auto overflow-hidden">
        <div className="flex flex-auto overflow-hidden">
          <AccTrCheckSidebar />
          <Suspense
            fallback={
              <div className="flex flex-auto justify-center items-center h-full w-full">
                <Spinner />
              </div>
            }
          >
            <Routes>
              <Route
                path="/deal"
                element={<AccountingCheckSyncedDealsPage />}
              />
              <Route
                path="/order"
                element={<AccountingCheckSyncedOrdersPage />}
              />
            </Routes>
          </Suspense>
        </div>
      </div>
    </Filter>
  );
};
