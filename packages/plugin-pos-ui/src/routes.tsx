import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";

const List = asyncComponent(
  () => import(/* webpackChunkName: "List" */ "./pos/containers/List")
);

const PosContainer = asyncComponent(
  () => import(/* webpackChunkName: "PosContainer" */ "./pos/containers/Pos")
);

const OrderList = asyncComponent(
  () => import(/* webpackChunkName: "OrderList" */ "./orders/containers/List")
);

const OrderRecords = asyncComponent(
  () =>
    import(/* webpackChunkName: "OrderList" */ "./orders/containers/Records")
);

const OrderSummary = asyncComponent(
  () =>
    import(/* webpackChunkName: "OrderList" */ "./orders/containers/Summary")
);

const CoverList = asyncComponent(
  () =>
    import(/* webpackChunkName: "OrderList" */ "./orders/containers/CoverList")
);

const PosProductList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PosProductList" */ "./orders/containers/ProductList"
    )
);

const PosOrdesByCustomers = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PosOrdesByCustomers" */ "./orders/containers/OrdersByCustomers"
    )
);

const PosOrdersBySubs = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PosOrdesBySubscriptions" */ "./orders/containers/OrdersBySubs"
    )
);

const SettingsComponent = () => {
  const location = useLocation();
  return <List queryParams={queryString.parse(location.search)} />;
};

const PosComponent = () => {
  const { posId } = useParams();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PosContainer queryParams={queryParams} posId={posId} />;
};

const OrderListComponent = () => {
  const location = useLocation();
  return <OrderList queryParams={queryString.parse(location.search)} />;
};

const OrderRecordsComponent = () => {
  const location = useLocation();
  return <OrderRecords queryParams={queryString.parse(location.search)} />;
};

const OrderSummaryComponent = () => {
  const location = useLocation();
  return <OrderSummary queryParams={queryString.parse(location.search)} />;
};

const CoverListComponent = () => {
  const location = useLocation();
  return <CoverList queryParams={queryString.parse(location.search)} />;
};

const OrderItemsComponent = () => {
  const location = useLocation();
  return <PosProductList queryParams={queryString.parse(location.search)} />;
};

const OrdersByCustomersCompoenent = () => {
  const location = useLocation();
  return (
    <PosOrdesByCustomers queryParams={queryString.parse(location.search)} />
  );
};

const OrdersBySubsCompoenent = () => {
  const location = useLocation();
  return <PosOrdersBySubs queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route key="/pos" path="/pos" element={<SettingsComponent />} />
      <Route
        key="/pos/edit/:posId"
        path="/pos/edit/:posId"
        element={<PosComponent />}
      />
      <Route key="/pos/create" path="/pos/create" element={<PosComponent />} />
      <Route
        key="/pos-orders"
        path="/pos-orders"
        element={<OrderListComponent />}
      />
      <Route
        key="/pos-covers"
        path="/pos-covers"
        element={<CoverListComponent />}
      />
      <Route
        key="/pos-order-items"
        path="/pos-order-items"
        element={<OrderItemsComponent />}
      />
      <Route
        key="/pos-order-records"
        path="/pos-order-records"
        element={<OrderRecordsComponent />}
      />
      <Route
        key="/pos-order-summary"
        path="/pos-order-summary"
        element={<OrderSummaryComponent />}
      />
      <Route
        key="/pos-orders-by-customers"
        path="/pos-orders-by-customers"
        element={<OrdersByCustomersCompoenent />}
      />
      <Route
        key="/pos-orders-by-subscriptions"
        path="/pos-orders-by-subscriptions"
        element={<OrdersBySubsCompoenent />}
      />
    </Routes>
  );
};

export default routes;
