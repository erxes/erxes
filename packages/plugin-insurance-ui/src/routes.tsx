import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const RiskList = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Risks" */ './modules/risks/containers/List'
  )
);

const ProductList = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Products" */ './modules/products/containers/List'
  )
);

const risks = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <RiskList typeId={type} history={history} />;
};

const products = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <ProductList typeId={type} history={history} />;
};

export const menu = [
  { title: 'Risks', link: '/insurance/risks' },
  { title: 'Products', link: '/insurance/products' }
];

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/insurance/risks/" component={risks} />
      <Route path="/insurance/products/" component={products} />
    </React.Fragment>
  );
};

export default routes;
