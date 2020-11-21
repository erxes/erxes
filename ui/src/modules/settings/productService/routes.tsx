import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const ProductList = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - ProductService" */ './containers/product/ProductList'
  )
);

const ProductDeatils = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - ProductService" */ './containers/product/detail/ProductDetails'
  )
);

const details = ({ match }) => {
  const id = match.params.id;

  return <ProductDeatils id={id} />;
};

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
      path="/settings/product-service/details/:id"
      exact={true}
      key="/settings/product-service/details/:id"
      component={details}
    />

    <Route
      path="/settings/product-service/"
      exact={true}
      key="/settings/product-service/"
      component={productService}
    />
  </React.Fragment>
);

export default routes;
