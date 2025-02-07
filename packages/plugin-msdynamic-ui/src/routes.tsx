import { Route, Routes, useLocation } from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const GeneralSettings = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Msdynamics" */ './containers/GeneralSettings'
    )
);

const SyncHistoryList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CheckSyncedDeals" */ './containers/SyncHistoryList'
    )
);

const InventoryProducts = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "InventoryProducts" */ './containers/InventoryProducts'
    )
);

const InventoryPrices = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "InventoryProducts" */ './containers/InventoryPrice'
    )
);

const InventoryCategory = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "InventoryProducts" */ './containers/InventoryCategory'
    )
);
const Customers = asyncComponent(
  () =>
    import(/* webpackChunkName: "InventoryProducts" */ './containers/Customers')
);

const CheckSyncedOrders = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CheckSyncedOrders" */ './containers/CheckSyncedOrders'
    )
);

const Msdynamics = () => {
  return <GeneralSettings />;
};

const SyncHistoryListComponent = () => {
  const location = useLocation();

  return <SyncHistoryList queryParams={queryString.parse(location.search)} />;
};

const InventoryProductList = () => {
  const location = useLocation();

  return <InventoryProducts queryParams={queryString.parse(location.search)} />;
};

const InventoryCategoryList = () => {
  const location = useLocation();

  return <InventoryCategory queryParams={queryString.parse(location.search)} />;
};

const CustomersList = () => {
  const location = useLocation();

  return <Customers queryParams={queryString.parse(location.search)} />;
};

const InventoryPriceList = () => {
  const location = useLocation();

  return <InventoryPrices queryParams={queryString.parse(location.search)} />;
};

const CheckSyncedOrderList = () => {
  const location = useLocation();

  return (
    <CheckSyncedOrders
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <Routes>
      <Route path="/msdynamics/" element={<Msdynamics />} />
      <Route
        key="/sync-msdynamic-history"
        path="/sync-msdynamic-history"
        element={<SyncHistoryListComponent />}
      />
      <Route
        key="/msdynamic-products"
        path="/msdynamic-products"
        element={<InventoryProductList />}
      />
      <Route
        key="/msdynamic-category"
        path="/msdynamic-category"
        element={<InventoryCategoryList />}
      />
      <Route
        key="/msdynamic-customers"
        path="/msdynamic-customers"
        element={<CustomersList />}
      />
      <Route
        key="/msdynamic-price"
        path="/msdynamic-price"
        element={<InventoryPriceList />}
      />
      <Route
        key="/msdynamic-sync-orders"
        path="/check-sync-orders"
        element={<CheckSyncedOrderList />}
      />
    </Routes>
  );
};

export default routes;
