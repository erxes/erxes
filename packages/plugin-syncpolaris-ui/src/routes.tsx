import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import GeneralSettings from "./settings/components/GeneralSettings";

const SyncHistoryList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CheckSyncedDeals" */ "./syncPolarisHistories/containers/SyncHistoryList"
    )
);
const Settings = asyncComponent(
  () =>
    import(/* webpackChunkName: "Settings" */ "./settings/containers/Settings")
);

const List = asyncComponent(
  () =>
    import(/* webpackChunkName: "customer" */ "./syncPolaris/containers/List")
);
const SyncHistoryListComponent = () => {
  const location = useLocation();

  return <SyncHistoryList queryParams={queryString.parse(location.search)} />;
};

const CustomerList = () => {
  const location = useLocation();

  return (
    <List
      queryParams={queryString.parse(location.search)}
      contentType="contacts:customer"
    />
  );
};
const TransactionSavingList = () => {
  const location = useLocation();

  return (
    <List
      queryParams={queryString.parse(location.search)}
      contentType="savings:transaction"
    />
  );
};
const TransactionLoanList = () => {
  const location = useLocation();

  return (
    <List
      queryParams={queryString.parse(location.search)}
      contentType="loans:transaction"
    />
  );
};

const SavingAcntList = () => {
  const location = useLocation();

  return (
    <List
      queryParams={queryString.parse(location.search)}
      contentType="savings:contract"
    />
  );
};
const LoanAcntList = () => {
  const location = useLocation();

  return (
    <List
      queryParams={queryString.parse(location.search)}
      contentType="loans:contract"
    />
  );
};

const GeneralSetting = () => {
  return <Settings component={GeneralSettings} configCode="POLARIS" />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        key="/erxes-plugin-polaris-polaris/settings/general"
        path="/erxes-plugin-sync-polaris/settings/general"
        element={<GeneralSetting />}
      />
      <Route
        key="/sync-polaris-history"
        path="/sync-polaris-history"
        element={<SyncHistoryListComponent />}
      />
      <Route key="/customer" path="/customer" element={<CustomerList />} />
      <Route
        key="/transaction-loan"
        path="/transaction-loan"
        element={<TransactionLoanList />}
      />
      <Route
        key="/transaction-saving"
        path="/transaction-saving"
        element={<TransactionSavingList />}
      />
      <Route
        key="/saving-account"
        path="/saving-acnt"
        element={<SavingAcntList />}
      />
      <Route key="/loan-account" path="/loan-acnt" element={<LoanAcntList />} />
    </Routes>
  );
};

export default routes;
