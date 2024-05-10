import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const RiskList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Risks" */ './modules/risks/containers/List'
    )
);

const ProductList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Products" */ './modules/products/containers/List'
    )
);

const CategoryList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Categories" */ './modules/categories/containers/List'
    )
);

const ItemList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Items" */ './modules/items/containers/List'
    )
);

const ItemDetail = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Detail - Item" */ './modules/items/containers/detail/Detail'
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

const categories = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <CategoryList typeId={type} history={history} />;
};

const items = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <ItemList queryParams={queryParams} history={history} />;
};

export const itemDetail = ({ match }) => {
  return <ItemDetail dealId={match.params.dealId} />;
};

export const menu = [
  { title: 'Risks', link: '/insurance/risks' },
  { title: 'Categories', link: '/insurance/categories' },
  { title: 'Products', link: '/insurance/products' },
  { title: 'Items', link: '/insurance/items/list' },
];

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/insurance/risks/" component={risks} />
      <Route path="/insurance/categories/" component={categories} />
      <Route path="/insurance/products/" component={products} />
      <Route path="/insurance/items/list" component={items} />
      <Route
        path="/insurance/items/detail/:dealId"
        component={itemDetail}
        key={'/insurance/items/detail/:dealId'}
        exact={true}
      />
    </React.Fragment>
  );
};

export default routes;
