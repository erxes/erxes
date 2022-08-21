import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';

const Store = asyncComponent(() =>
  import(/* webpackChunkName: "List - Store" */ './containers/Store')
);

const store = ({ location }) => {
  return <Store queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return <Route path="/payments/" component={store} />;
};

export default routes;
