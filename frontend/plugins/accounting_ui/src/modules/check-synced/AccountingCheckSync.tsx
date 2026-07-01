import { Filter, Spinner } from 'erxes-ui';
import { Suspense, lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AccTrCheckSidebar } from '~/modules/check-synced/components/Sidebar';
import { AccountingHeader } from '~/modules/layout/components/Header';

const AccountingCheckSyncedDealsPage = lazy(() =>
  import('~/modules/check-synced/deals/components/AccountingCheckSyncedDealsPage').then(
    (module) => ({
      default: module.AccountingCheckSyncedDealsPage,
    }),
  ),
);

const AccountingCheckSyncedOrdersPage = lazy(() =>
  import('~/modules/check-synced/orders/components/AccountingCheckSyncedOrdersPage').then(
    (module) => ({
      default: module.AccountingCheckSyncedOrdersPage,
    }),
  ),
);

export const AccountingCheckSync = () => {
  const { t } = useTranslation('accounting');

  return (
    <Filter id="accounting-check-sync">
      <div className="flex flex-col flex-auto overflow-hidden">
        <AccountingHeader
          returnLink="/accounting/check-sync"
          returnText={t('Check-sync')}
        />
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
              <Route index element={<Navigate to="deal" replace />} />
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
