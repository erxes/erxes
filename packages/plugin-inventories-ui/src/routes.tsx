import React from 'react';
import { Route } from 'react-router-dom';
// erxes
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const remainders = asyncComponent(() =>
  import(
    /* webpackChunkName: 'List - LiveRemainders' */ './remainders/containers/List'
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

const transactions = asyncComponent(() =>
  import(
    /* webpackChunkName: 'List - Transactions' */ './transactions/containers/List'
  )
);

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
        path="/inventories/transactions/"
        key="/inventories/transactions"
        component={transactions}
      />
    </>
  );
};

export default routes;
