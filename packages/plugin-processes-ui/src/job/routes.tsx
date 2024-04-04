import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const ProductList = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - ProductService" */ './containers/refer/List'
  )
);

const productService = ({ location, history }) => {
  return (
    <ProductList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <Route
      path="/processes/jobs"
      exact={true}
      key="/processes/jobs"
      component={productService}
    />
  );
};

export default routes;
