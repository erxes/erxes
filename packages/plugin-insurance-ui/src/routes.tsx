import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
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

const Risks = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;
  const history = useNavigate();

  return <RiskList typeId={type} history={history} />;
};

const Products = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;
  const history = useNavigate();

  return <ProductList queryParams={queryParams} history={history} />;
};

const Categories = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;
  const history = useNavigate();

  return <CategoryList typeId={type} history={history} />;
};

const Items = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const history = useNavigate();

  return <ItemList queryParams={queryParams} history={history} />;
};

export const Item = () => {
  console.log("ITEM ")
  // const { dealId } = useParams();
  const params = useParams()
  console.log("params", params)
  return <ItemDetail dealId={params.dealId} />;
};

export const menu = [
  { title: 'Risks', link: '/insurance/risks' },
  { title: 'Categories', link: '/insurance/categories' },
  { title: 'Products', link: '/insurance/products' },
  { title: 'Items', link: '/insurance/items/list' },
];

const routes = () => {
  return (
    <Routes>
      <Route path="/insurance/risks/" element={<Risks />} />
      <Route path="/insurance/categories/" element={<Categories />} />
      <Route path="/insurance/products/" element={<Products />} />
      <Route path="/insurance/items/list" element={<Items />} />
      <Route
        path="/insurance/items/detail/:dealId"
        key={'/insurance/items/detail/:dealId'}
        element={<Item />}
      />
    </Routes>
  );
};

export default routes;
