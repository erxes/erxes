import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import GeneralSettings from './settings/components/GeneralSettings';

const List = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Syncpolariss" */ './polaris/containers/List'
    ),
);
const Settings = asyncComponent(
  () =>
    import(/* webpackChunkName: "Settings" */ './settings/containers/Settings'),
);

const CustomAcntBalance = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CheckSyncedDeals" */ './customerAcntBalance/containers/customerAcntBalance'
    ),
);

const Customer = asyncComponent(
  () => import(/* webpackChunkName: "customer" */ './customer/containers/List'),
);

const Transaction = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "transaction" */ './transaction/containers/List'
    ),
);

const DepositAcnt = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "depositAcnt" */ './depositAcnt/containers/List'
    ),
);

const LoanAcnt = asyncComponent(
  () => import(/* webpackChunkName: "loanAcnt" */ './loanAcnt/containers/List'),
);

const SavingAcnt = asyncComponent(
  () =>
    import(/* webpackChunkName: "savingAcnt" */ './savingAcnt/containers/List'),
);

const syncpolariss = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <List typeId={type} history={history} />;
};

const customerList = ({ location, history }) => {
  return (
    <Customer
      queryParams={queryString.parse(location.search)}
      history={history}
      contractType="contacts:customer"
    />
  );
};
const transactionList = ({ location, history }) => {
  return (
    <Transaction
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};
const depositAcntList = ({ location, history }) => {
  return (
    <DepositAcnt
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
      <Route path="/syncpolariss/" component={syncpolariss} />;
      <Route
        key="/erxes-plugin-polaris-polaris/settings/general"
        exact={true}
        path="/erxes-plugin-sync-polaris/settings/general"
        component={GeneralSetting}
      />
      <Route
        key="/customer"
        exact={true}
        path="/customer"
        component={customerList}
      />
      <Route
        key="/transaction"
        exact={true}
        path="/transaction"
        component={transactionList}
      />
      <Route
        key="/saving-account"
        exact={true}
        path="/saving-acnt"
        component={savingAcntList}
      />
      <Route
        key="/deposit-account"
        exact={true}
        path="/deposit-acnt"
        component={depositAcntList}
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
