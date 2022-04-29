import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const CarList = asyncComponent(() =>
  import(/* webpackChunkName: "SegmentsList" */ './containers/CarsList')
);

const CarDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "SegmentsForm" */ './containers/detail/CarDetails'
  )
);

const ProductList = asyncComponent(() =>
  import(/* webpackChunkName: "SegmentsForm" */ './containers/ProductList')
);

const ProductDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "SegmentsForm" */ './containers/detail/ProductDetails'
  )
);

const details = ({ match }) => {
  const id = match.params.id;

  return <CarDetails id={id} />;
};

const list = ({ location, history }) => {
  return (
    <CarList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const productdetails = ({ match }) => {
  const id = match.params.id;

  return <ProductDetails id={id} />;
};

const product = ({ location, history }) => {
  return (
    <ProductList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route key="/list" exact={true} path="/list" component={list} />

      <Route
        key="/details/:id"
        exact={true}
        path="/details/:id"
        component={details}
      />

      <Route key="/product" exact={true} path="/product" component={product} />

      <Route
        key="/product/details/:id"
        exact={true}
        path="/product/details/:id"
        component={productdetails}
      />
    </React.Fragment>
  );
};

export default routes;
