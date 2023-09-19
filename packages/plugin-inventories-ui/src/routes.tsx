import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import ListComponentDoc from './safeRemainderDetails/components/PrintDoc';
import ListComponent from './safeRemainderDetails/components/Print';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const remainders = asyncComponent(() =>
  import(
    /* webpackChunkName: 'List - LiveRemainders' */ './remainders/containers/List'
  )
);
const ReserveRems = asyncComponent(() =>
  import(
    /* webpackChunkName: 'List - LiveRemainders' */ './reserveRemainders/containers/List'
  )
);

const safeRemainders = asyncComponent(() =>
  import(
    /* webpackChunkName: 'List - SafeRemainders' */ './safeRemainders/containers/List'
  )
);

const safeRemainderDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: 'List - SafeRemainders' */ './safeRemainderDetails/containers/List'
  )
);

const SafeRemainderDetailsPrint = asyncComponent(() =>
  import(
    /* webpackChunkName: 'List - SafeRemainders' */ './safeRemainderDetails/containers/Print'
  )
);

const transactions = asyncComponent(() =>
  import(
    /* webpackChunkName: 'List - Transactions' */ './transactions/containers/List'
  )
);

const RemaindersLog = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - ProductService" */ './remainders/containers/RemaindersLog'
  )
);

const safeRemainderDetailsPrintDoc = () => {
  return <SafeRemainderDetailsPrint component={ListComponentDoc} />;
};

const safeRemainderDetailsPrint = () => {
  return <SafeRemainderDetailsPrint component={ListComponent} />;
};

const remaindersLog = ({ match, location }) => {
  const id = match.params.id;

  return (
    <RemaindersLog id={id} queryParams={queryString.parse(location.search)} />
  );
};

const reserveRems = ({ location, history }) => {
  return (
    <ReserveRems
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route
        exact={true}
        path="/inventories/remainders/"
        key="/inventories/remainders/"
        component={remainders}
      />

      <Route
        exact={true}
        path="/inventories/reserve-remainders/"
        key="/inventories/reserve-remainders/"
        component={reserveRems}
      />

      <Route
        exact={true}
        path="/inventories/safe-remainders/"
        key="/inventories/safe-remainders/"
        component={safeRemainders}
      />

      <Route
        exact={true}
        path="/inventories/safe-remainders/details/:id"
        key="/inventories/safe-remainders/details/:id"
        component={safeRemainderDetails}
      />

      <Route
        exact={true}
        path="/inventories/safe-remainders/detailsPrint/:id"
        key="/inventories/safe-remainders/detailsPrint/:id"
        component={safeRemainderDetailsPrint}
      />
      <Route
        exact={true}
        path="/inventories/safe-remainders/detailsPrintDoc/:id"
        key="/inventories/safe-remainders/detailsPrintDoc/:id"
        component={safeRemainderDetailsPrintDoc}
      />

      <Route
        exact={true}
        path="/inventories/transactions/"
        key="/inventories/transactions"
        component={transactions}
      />

      <Route
        exact={true}
        path="/inventories/remainders-log/"
        key="/inventories/remainders-log"
        component={remaindersLog}
      />
    </>
  );
};

export default routes;
