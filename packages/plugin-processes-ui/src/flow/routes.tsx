import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const ProductList = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - ProductService" */ './containers/product/ProductList'
  )
);

const Details = asyncComponent(() =>
  import(
    /* webpackChunkName: "AutomationDetails" */ './containers/product/EditAutomation'
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

const details = ({ match, location }) => {
  const id = match.params.id;
  const queryParams = queryString.parse(location.search);

  return <Details id={id} queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Route
      path="/processes/flows"
      exact={true}
      key="/processes/flows"
      component={productService}
    />
  );
};

export default routes;
