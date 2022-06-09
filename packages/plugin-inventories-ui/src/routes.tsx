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

const remainders = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  return <Remainders queryParams={queryParams} history={history} />;
};

const safeRemainders = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  return <SafeRemainders queryParams={queryParams} history={history} />;
};

const routes = () => {
  return (
    <>
      <Route path="/inventories/remainders/" component={remainders} />
      <Route path="/inventories/safe-remainders/" component={safeRemainders} />
    </>
  );
};

export default routes;
