import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Remainders = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - LiveRemainders" */ './remainders/containers/ProductList'
  )
);

const SafeRemainders = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - SafeRemainders" */ './safeRemainders/containers/List'
  )
);

const SafeRemainderDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - SafeRemainders" */ './safeRemainders/containers/Details'
  )
);

const Transactions = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Transactions" */ './transactions/containers/List'
  )
);

const remainders = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  return <Remainders queryParams={queryParams} history={history} />;
};

const safeRemainders = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  return <SafeRemainders queryParams={queryParams} history={history} />;
};

const safeRemainderDetails = ({ match, location, history }) => {
  const id = match.params.id;
  const queryParams = queryString.parse(location.search);

  return (
    <SafeRemainderDetails id={id} queryParams={queryParams} history={history} />
  );
};

const transactions = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  return <Transactions queryParams={queryParams} history={history} />;
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
