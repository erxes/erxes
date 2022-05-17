import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import Settings from './containers/config/Settings';
import Uom from './containers/config/Uoms';
import GeneralSettings from './components/config/GeneralSettings';

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

const generalSetting = () => {
  return <Settings component={GeneralSettings} />;
};

const uomManage = () => {
  return <Uom history={history} />;
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

    <Route
      path="/settings/products-config/"
      exact={true}
      key="/settings/products-config/"
      component={generalSetting}
    />

    <Route
      path="/settings/uoms-manage/"
      exact={true}
      key="/settings/uoms-manage/"
      component={uomManage}
    />
  </React.Fragment>
);

export default routes;
