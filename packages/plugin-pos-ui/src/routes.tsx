import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List" */ './pos/containers/List')
);

const PosContainer = asyncComponent(() =>
  import(/* webpackChunkName: "PosContainer" */ './pos/containers/Pos')
);

const OrderList = asyncComponent(() =>
  import(/* webpackChunkName: "OrderList" */ './orders/containers/List')
);

const PosProductList = asyncComponent(() =>
  import(
    /* webpackChunkName: "PosProductList" */ './orders/containers/ProductList'
  )
);

const settingsComponent = ({ location, history }) => {
  return (
    <List queryParams={queryString.parse(location.search)} history={history} />
  );
};

const posComponent = ({ match, location, history }) => {
  const { posId } = match.params;
  const queryParams = queryString.parse(location.search);

  return (
    <PosContainer queryParams={queryParams} posId={posId} history={history} />
  );
};

const OrderListComponent = ({ location, history }) => {
  return (
    <OrderList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};
const OrderItemsComponent = ({ location, history }) => {
  return (
    <PosProductList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route
        key="/pos"
        exact={true}
        path="/pos"
        component={settingsComponent}
      />
      <Route
        key="/pos/edit/:posId"
        exact={true}
        path="/pos/edit/:posId"
        component={posComponent}
      />
      <Route
        key="/pos/create"
        exact={true}
        path="/pos/create"
        component={posComponent}
      />
      <Route
        key="/pos-orders"
        exact={true}
        path="/pos-orders"
        component={OrderListComponent}
      />
      <Route
        key="/pos-order-items"
        exact={true}
        path="/pos-order-items"
        component={OrderItemsComponent}
      />
    </>
  );
};

export default routes;
