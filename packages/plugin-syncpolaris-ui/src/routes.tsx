import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import GeneralSettings from './settings/components/GeneralSettings';

const SyncHistoryList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CheckSyncedDeals" */ './syncPolarisHistories/containers/SyncHistoryList'
    ),
);

const Settings = asyncComponent(
  () =>
    import(/* webpackChunkName: "Settings" */ './settings/containers/Settings'),
);

const Customer = asyncComponent(
  () => import(/* webpackChunkName: "customer" */ './customer/containers/List'),
);
const syncHistoryList = ({ location, history }) => {
  return (
    <SyncHistoryList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const TransactionSaving = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "transaction" */ './transactionSaving/containers/List'
    ),
);

const TransactionLoan = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "transaction" */ './transactionLoan/containers/List'
    ),
);
const LoanAcnt = asyncComponent(
  () => import(/* webpackChunkName: "loanAcnt" */ './loanAcnt/containers/List'),
);

const SavingAcnt = asyncComponent(
  () =>
    import(/* webpackChunkName: "savingAcnt" */ './savingAcnt/containers/List'),
);

const customerList = ({ location, history }) => {
  return (
    <Customer
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};
const transactionSavingList = ({ location, history }) => {
  return (
    <TransactionSaving
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};
const transactionLoanList = ({ location, history }) => {
  return (
    <TransactionLoan
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const savingAcntList = ({ location, history }) => {
  return (
    <SavingAcnt
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};
const loanAcntList = ({ location, history }) => {
  return (
    <LoanAcnt
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const GeneralSetting = () => {
  return <Settings component={GeneralSettings} configCode="POLARIS" />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/erxes-plugin-polaris-polaris/settings/general"
        exact={true}
        path="/erxes-plugin-sync-polaris/settings/general"
        component={GeneralSetting}
      />
      <Route
        key="/sync-polaris-history"
        exact={true}
        path="/sync-polaris-history"
        component={syncHistoryList}
      />
      <Route
        key="/customer"
        exact={true}
        path="/customer"
        component={customerList}
      />
      <Route
        key="/transaction-loan"
        exact={true}
        path="/transaction-loan"
        component={transactionLoanList}
      />
      <Route
        key="/transaction-saving"
        exact={true}
        path="/transaction-saving"
        component={transactionSavingList}
      />
      <Route
        key="/saving-account"
        exact={true}
        path="/saving-acnt"
        component={savingAcntList}
      />
      <Route
        key="/loan-account"
        exact={true}
        path="/loan-acnt"
        component={loanAcntList}
      />
    </React.Fragment>
  );
};

export default routes;
