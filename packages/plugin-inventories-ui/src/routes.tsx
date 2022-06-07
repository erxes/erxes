import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Tags" */ './remainders/containers/ProductList'
  )
);

const remainders = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  return <List queryParams={queryParams} history={history} />;
};

const routes = () => {
  return <Route path="/inventories/remainders/" component={remainders} />;
};

export default routes;
