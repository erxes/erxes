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

const PackageList = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Packages" */ './modules/productPackages/containers/List'
  )
);

const CategoryList = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Categories" */ './modules/categories/containers/List'
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

const packageList = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <PackageList typeId={type} history={history} />;
};

const categories = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <CategoryList typeId={type} history={history} />;
};

export const menu = [
  { title: 'Risks', link: '/insurance/risks' },
  { title: 'Categories', link: '/insurance/categories' },
  { title: 'Products', link: '/insurance/products' }
  // { title: 'Packages', link: '/insurance/packages' }
];

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/insurance/risks/" component={risks} />
      <Route path="/insurance/categories/" component={categories} />
      <Route path="/insurance/products/" component={products} />
      <Route path="/insurance/packages/" component={packageList} />
    </React.Fragment>
  );
};

export default routes;
