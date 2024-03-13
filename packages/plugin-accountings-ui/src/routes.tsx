import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import Settings from './containers/config/Settings';
import GeneralSettings from './components/config/GeneralSettings';

const ProductList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings List - ProductService" */ './containers/account/AccountList'
    ),
);

const ProductDetails = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings List - ProductService" */ './containers/account/detail/AccountDetails'
    ),
);

const details = ({ match }) => {
  const id = match.params.id;

  return <ProductDetails id={id} />;
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

const routes = () => (
  <React.Fragment>
    <Route
      path="/settings/accounts/details/:id"
      exact={true}
      key="/settings/accounts/details/:id"
      component={details}
    />

    <Route
      path="/settings/accounts/"
      exact={true}
      key="/settings/accounts/"
      component={productService}
    />

    <Route
      path="/settings/account-config/"
      exact={true}
      key="/settings/account-config/"
      component={generalSetting}
    />
  </React.Fragment>
);

export default routes;
