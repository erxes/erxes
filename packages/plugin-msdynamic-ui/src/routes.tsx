import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import queryString from "query-string";

const GeneralSettings = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Msdynamics" */ "./containers/GeneralSettings"
    )
);

const SyncHistoryList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "CheckSyncedDeals" */ "./containers/SyncHistoryList"
    )
);

const InventoryProducts = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "InventoryProducts" */ "./containers/InventoryProducts"
    )
);

const InventoryPrices = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "InventoryProducts" */ "./containers/InventoryPrice"
    )
);

const InventoryCategory = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "InventoryProducts" */ "./containers/InventoryCategory"
    )
);
const Customers = asyncComponent(
  () =>
    import(/* webpackChunkName: "InventoryProducts" */ "./containers/Customers")
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
    </Routes>
  );
};

export default routes;
