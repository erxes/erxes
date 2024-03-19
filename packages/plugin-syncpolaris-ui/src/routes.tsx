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

const List = asyncComponent(
  () =>
    import(/* webpackChunkName: "customer" */ './syncPolaris/containers/List'),
);
const syncHistoryList = ({ location, history }) => {
  return (
    <SyncHistoryList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const customerList = ({ location, history }) => {
  return (
    <List
      queryParams={queryString.parse(location.search)}
      history={history}
      contentType="contacts:customer"
    />
  );
};
const transactionSavingList = ({ location, history }) => {
  return (
    <List
      queryParams={queryString.parse(location.search)}
      history={history}
      contentType="savings:transaction"
    />
  );
};
const transactionLoanList = ({ location, history }) => {
  return (
    <List
      queryParams={queryString.parse(location.search)}
      history={history}
      contentType="loans:transaction"
    />
  );
};

const savingAcntList = ({ location, history }) => {
  return (
    <List
      queryParams={queryString.parse(location.search)}
      history={history}
      contentType="savings:contract"
    />
  );
};
const loanAcntList = ({ location, history }) => {
  return (
    <List
      queryParams={queryString.parse(location.search)}
      history={history}
      contentType="loans:contract"
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
