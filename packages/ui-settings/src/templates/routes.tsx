import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const ProductList = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - ProductService" */ './containers/product/ProductList'
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

const routes = () => (
  <React.Fragment>
    <Route
      path="/settings/templates/"
      exact={true}
      key="/settings/templates/"
      component={productService}
    />
  </React.Fragment>
);

export default routes;
