import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import Settings from './containers/config/Settings';
import Uom from './containers/config/Uoms';
import GeneralSettings from './components/config/GeneralSettings';
import SimilarityGroup from './components/config/SimilarityGroup';

const ProductList = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - ProductService" */ './containers/product/ProductList'
  )
);

const ProductDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - ProductService" */ './containers/product/detail/ProductDetails'
  )
);

const BarcodeGenerator = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - ProductService" */ './containers/barcodeGenerator/BarcodeGenerator'
  )
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

const uomManage = () => {
  return <Uom history={history} />;
};

const barcodeGenerator = ({ match, location }) => {
  const id = match.params.id;

  return (
    <BarcodeGenerator
      id={id}
      queryParams={queryString.parse(location.search)}
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

    <Route
      path="/settings/uoms-manage/"
      exact={true}
      key="/settings/uoms-manage/"
      component={uomManage}
    />

    <Route
      path="/settings/barcode-generator/:id"
      exact={true}
      key="/settings/barcode-generator/:id"
      component={barcodeGenerator}
    />
  </React.Fragment>
);

export default routes;
