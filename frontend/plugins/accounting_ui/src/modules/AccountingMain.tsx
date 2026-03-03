import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';
import { Spinner } from 'erxes-ui';
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

const PluginAccounting = () => {
  return (
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
        <Route path="/adjustment" element={<AdjustmentsHomePage />} />
        <Route path="/adjustment/inventory" element={<AdjustInventoryList />} />
        <Route
          path="/adjustment/inventory/detail"
          element={<AdjustInventoryDetail />}
        />
        <Route path="/journal-reports" element={<AccountingJournalReports />} />
        <Route
          path="/gen-journal-report"
          element={<AccountingGenJournalReport />}
        />

        <Route
          path="/inventories/remainders"
          element={<InventoryRemainders />}
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
      </Routes>
      <PageChangeEffect />
    </Suspense>
  );
};

export default PluginAccounting;
