import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "Settings List - ProductService" */ './containers/Product/ProductList')
);

const productService = ({ location, history }) => {
  return (
    <List queryParams={queryString.parse(location.search)} history={history} />
  );
};

const routes = () => (
  <Route path="/settings/product-service/" component={productService} />
);

export default routes;
