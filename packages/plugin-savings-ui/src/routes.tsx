import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import Settings from './settings/containers/Settings';
import HolidaySettings from './settings/components/HolidaySettings';

const ContractList = asyncComponent(() =>
  import(/* webpackChunkName: "ContractList" */ './contracts/containers/List')
);

const ContractDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "ContractDetails" */ './contracts/containers/detail/ContractDetails'
  )
);
const PeriodLockDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "PeriodLockDetails" */ './periodLocks/containers/PeriodLockDetails'
  )
);

const TransactionList = asyncComponent(() =>
  import(
    /* webpackChunkName: "TransactionList" */ './transactions/containers/TransactionsList'
  )
);
const PeriodLockList = asyncComponent(() =>
  import(
    /* webpackChunkName: "PeriodLockList" */ './periodLocks/containers/PeriodLocksList'
  )
);

const ContractTypesList = asyncComponent(() =>
  import(
    /* webpackChunkName: "ContractTypesList" */ './contractTypes/containers/ContractTypesList'
  )
);
const ContractTypeDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "ContractTypeDetails" */ './contractTypes/containers/ContractTypeDetails'
  )
);

const contractLists = ({ location, history }) => {
  return (
    <ContractList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const detailsOfContract = ({ match }) => {
  const id = match.params.id;

  return <ContractDetails id={id} />;
};

const periodLockDetail = ({ match }) => {
  const id = match.params.id;

  return <PeriodLockDetails id={id} />;
};

const transactionLists = ({ location, history }) => {
  return (
    <TransactionList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const periodLockLists = ({ location, history }) => {
  return (
    <PeriodLockList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const contractTypesLists = ({ location, history }) => {
  return (
    <ContractTypesList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const contractTypeDetail = ({ match }) => {
  const id = match.params.id;

  return <ContractTypeDetails id={id} />;
};

const holidaySettings = () => {
  return <Settings components={HolidaySettings}></Settings>;
};

const SavingRoutes = () => {
  return (
    <React.Fragment>
      <Route
        key="/erxes-plugin-saving/contract-list"
        path="/erxes-plugin-saving/contract-list"
        exact={true}
        component={contractLists}
      />
      <Route
        path="/erxes-plugin-saving/contract-details/:id"
        component={detailsOfContract}
      />
      <Route
        path="/erxes-plugin-saving/transaction-list"
        component={transactionLists}
      />
      <Route
        path="/erxes-plugin-saving/contract-types"
        component={contractTypesLists}
      />
      <Route
        path="/erxes-plugin-saving/contract-type-details/:id"
        component={contractTypeDetail}
      />

      <Route
        path="/erxes-plugin-saving/holiday-settings"
        component={holidaySettings}
      />
      <Route
        path="/erxes-plugin-saving/periodLock-list"
        component={periodLockLists}
      />
      <Route
        path="/erxes-plugin-saving/periodLock-details/:id"
        component={periodLockDetail}
      />
    </React.Fragment>
  );
};

export default SavingRoutes;
