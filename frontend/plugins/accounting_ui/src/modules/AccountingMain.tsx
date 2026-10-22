import { PluginSettingsRoutes } from 'ui-modules';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { Spinner, AppLayout } from 'erxes-ui';
import {
  AccountingSidebar,
  AccountingSidebarFooter,
  AccountingSettingsLayout,
} from '~/Sidebar';
import { PageChangeEffect } from './app/AccountingPageChangeEffect';

const TransactionList = lazy(() =>
  import('~/pages/TransactionListPage').then((module) => ({
    default: module.TransactionListPage,
  })),
);

const TrRecordList = lazy(() =>
  import('~/pages/TrRecordListPage').then((module) => ({
    default: module.TrRecordListPage,
  })),
);

const TransactionForm = lazy(() =>
  import('~/pages/TransactionFormPage').then((module) => ({
    default: module.TransactionPage,
  })),
);

const AdjustmentsHomePage = lazy(() =>
  import('~/pages/AdjustmentsPage').then((module) => ({
    default: module.AdjustmentsHomePage,
  })),
);

const AdjustInventoryList = lazy(() =>
  import('~/pages/AdjustInventoryListPage').then((module) => ({
    default: module.AdjustInventoryListPage,
  })),
);

const AdjustInventoryDetail = lazy(() =>
  import('~/pages/AdjustInventoryDetailPage').then((module) => ({
    default: module.AdjustInventoryDetailPage,
  })),
);

const AdjustFundRateList = lazy(() =>
  import('~/pages/AdjustFundRateListPage').then((module) => ({
    default: module.AdjustFundRateListPage,
  })),
);

const AdjustFundRateDetail = lazy(() =>
  import('~/pages/AdjustFundRateDetailPage').then((module) => ({
    default: module.AdjustFundRateDetailPage,
  })),
);

const AdjustDebtRateList = lazy(() =>
  import('~/pages/AdjustDebtRateListPage').then((module) => ({
    default: module.AdjustDebtRateListPage,
  })),
);

const AdjustDebtRateDetail = lazy(() =>
  import('~/pages/AdjustDebtRateDetailPage').then((module) => ({
    default: module.AdjustDebtRateDetailPage,
  })),
);

const AdjustFixedAssetList = lazy(() =>
  import('~/pages/AdjustFixedAssetListPage').then((module) => ({
    default: module.AdjustFixedAssetListPage,
  })),
);

const AdjustFixedAssetDetail = lazy(() =>
  import('~/pages/AdjustFixedAssetDetailPage').then((module) => ({
    default: module.AdjustFixedAssetDetailPage,
  })),
);

const AccountingJournalReports = lazy(() =>
  import('~/pages/JournalReports').then((module) => ({
    default: module.JournalReports,
  })),
);

const AccountingGenJournalReport = lazy(() =>
  import('~/pages/GenJournalReport').then((module) => ({
    default: module.GenJournalReport,
  })),
);

const InventoryRemainders = lazy(() =>
  import('~/pages/inventories/RemaindersPage').then((module) => ({
    default: module.RemaindersPage,
  })),
);
const InventorySafeRemainders = lazy(() =>
  import('~/pages/inventories/SafeRemaindersPage').then((module) => ({
    default: module.SafeRemaindersPage,
  })),
);
const InventorySafeRemainderDetail = lazy(() =>
  import('~/pages/inventories/SafeRemainderDetailPage').then((module) => ({
    default: module.SafeRemainderDetailPage,
  })),
);
const InventoryReserveRemainders = lazy(() =>
  import('~/pages/inventories/ReserveRemaindersPage').then((module) => ({
    default: module.ReserveRemaindersPage,
  })),
);
const JobExecutions = lazy(() =>
  import('~/pages/inventories/JobExecutionsPage').then((module) => ({
    default: module.JobExecutionsPage,
  })),
);

const FxaOwnerRecords = lazy(() =>
  import('~/pages/fixed-assets/FxaOwnerRecordsPage').then((module) => ({
    default: module.FxaOwnerRecordsPage,
  })),
);

const FxaRemainders = lazy(() =>
  import('~/pages/fixed-assets/FxaRemaindersPage').then((module) => ({
    default: module.FxaRemaindersPage,
  })),
);

const TransactionPrint = lazy(() =>
  import('~/pages/TransactionPrintPage').then((module) => ({
    default: module.TransactionPrintPage,
  })),
);

const AdjustClosingList = lazy(() =>
  import('~/pages/AdjustClosingPage').then((module) => ({
    default: module.AdjustClosingListPage,
  })),
);

const AdjustClosingDetail = lazy(() =>
  import('~/pages/AdjustClosingDetailPage').then((module) => ({
    default: module.AdjustClosingDetailPage,
  })),
);

const AccountingCheckSync = lazy(() =>
  import('~/modules/check-synced/AccountingCheckSync').then((module) => ({
    default: module.AccountingCheckSync,
  })),
);

const PluginAccounting = () => {
  return (
    <AppLayout
      id="accounting"
      title="Accounting"
      sidebar={<AccountingSidebar />}
      footer={<AccountingSidebarFooter />}
    >
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-full">
            <Spinner size="sm" />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<TransactionList />} />
          <Route path="/main" element={<TransactionList />} />
          <Route path="/records" element={<TrRecordList />} />
          <Route path="/transaction/edit" element={<TransactionForm />} />
          <Route path="/transaction/create" element={<TransactionForm />} />
          <Route path="transaction/print" element={<TransactionPrint />} />
          <Route path="/adjustment" element={<AdjustmentsHomePage />} />
          <Route
            path="/adjustment/inventory"
            element={<AdjustInventoryList />}
          />
          <Route
            path="/adjustment/inventory/detail"
            element={<AdjustInventoryDetail />}
          />
          <Route path="/adjustment/fundRate" element={<AdjustFundRateList />} />
          <Route
            path="/adjustment/fundRate/detail"
            element={<AdjustFundRateDetail />}
          />
          <Route path="/adjustment/debRate" element={<AdjustDebtRateList />} />
          <Route
            path="/adjustment/debRate/detail"
            element={<AdjustDebtRateDetail />}
          />
          <Route path="/adjustment/fxa" element={<AdjustFixedAssetList />} />
          <Route
            path="/adjustment/fxa/detail"
            element={<AdjustFixedAssetDetail />}
          />
          <Route
            path="/journal-reports"
            element={<AccountingJournalReports />}
          />
          <Route path="/check-sync/*" element={<AccountingCheckSync />} />
          <Route
            path="/gen-journal-report"
            element={<AccountingGenJournalReport />}
          />

          <Route
            path="/inventories/remainders"
            element={<InventoryRemainders />}
          />
          <Route
            path="/inventories/job-executions"
            element={<JobExecutions />}
          />
          <Route
            path="/inventories/safe-remainders"
            element={<InventorySafeRemainders />}
          />
          <Route
            path="/inventories/safe-remainder/detail"
            element={<InventorySafeRemainderDetail />}
          />
          <Route
            path="/inventories/reserve-remainders"
            element={<InventoryReserveRemainders />}
          />
          <Route
            path="/fixed-assets/owner-records"
            element={<FxaOwnerRecords />}
          />
          <Route path="/fixed-assets/remainders" element={<FxaRemainders />} />
          <Route path="adjustment/closing" element={<AdjustClosingList />} />
          <Route
            path="adjustment/closing/:id"
            element={<AdjustClosingDetail />}
          />
        </Routes>
        <PageChangeEffect />
      </Suspense>
    </AppLayout>
  );
};

const AccountingSettingsRoutes = lazy(() =>
  import('~/modules/AccountingSettings').then((module) => ({
    default: module.AccountingSettings,
  })),
);
// JSX needs a capitalised name.
const AccountingAppRoutes = PluginAccounting;

/** The plugin owns its settings too: `/accounting/settings/*` has its own sidebar. */
const AccountingEntry = () => (
  <Routes>
    <Route
      path="settings/*"
      element={
        <AccountingSettingsLayout>
          <Suspense fallback={<Spinner />}>
            <PluginSettingsRoutes
              pluginName="accounting"
              basePath="/accounting/settings"
            >
              <AccountingSettingsRoutes />
            </PluginSettingsRoutes>
          </Suspense>
        </AccountingSettingsLayout>
      }
    />
    <Route path="*" element={<AccountingAppRoutes />} />
  </Routes>
);

export default AccountingEntry;
