import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import Settings from './containers/config/Settings';
import GeneralSettings from './components/config/GeneralSettings';
import SimilarityGroup from './components/config/SimilarityGroup';

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

const similarityGroup = () => {
  return <Settings component={SimilarityGroup} />;
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
      path="/settings/similarity-group/"
      exact={true}
      key="/settings/similarity-group"
      component={similarityGroup}
    />
  </React.Fragment>
);

export default routes;
