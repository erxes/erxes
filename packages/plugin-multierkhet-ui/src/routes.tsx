import Settings from './containers/Settings';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const GeneralSettings = asyncComponent(() =>
  import(
    /* webpackChunkName: "GeneralSettings" */ './components/GeneralSettings'
  )
);

const StageSettings = asyncComponent(() =>
  import(
    /* webpackChunkName: "StageSettings" */ './components/SaleStageSettings'
  )
);

const ReturnStageSettings = asyncComponent(() =>
  import(
    /* webpackChunkName: "ReturnStageSettings" */ './components/ReturnStageSettings'
  )
);

const PipelineSettings = asyncComponent(() =>
  import(
    /* webpackChunkName: "PipelineSettings" */ './components/RemPipelineSettings'
  )
);

const SyncHistoryList = asyncComponent(() =>
  import(
    /* webpackChunkName: "CheckSyncedDeals" */ './containers/SyncHistoryList'
  )
);

const CheckSyncedDeals = asyncComponent(() =>
  import(
    /* webpackChunkName: "CheckSyncedDeals" */ './containers/CheckSyncedDeals'
  )
);

const CheckSyncedOrders = asyncComponent(() =>
  import(
    /* webpackChunkName: "CheckSyncedOrders" */ './containers/CheckSyncedOrders'
  )
);

const InventoryProducts = asyncComponent(() =>
  import(
    /* webpackChunkName: "InventoryProducts" */ './containers/InventoryProducts'
  )
);

const InventoryCategory = asyncComponent(() =>
  import(
    /* webpackChunkName: "InventoryCategors" */ './containers/InventoryCategory'
  )
);

const GeneralSetting = () => {
  return <Settings component={GeneralSettings} configCode="erkhetConfig" />;
};

const StageSetting = () => {
  return <Settings component={StageSettings} configCode="stageInSaleConfig" />;
};

const ReturnStageSetting = () => {
  return (
    <Settings
      component={ReturnStageSettings}
      configCode="stageInReturnConfig"
    />
  );
};

const PipelineSetting = () => {
  return <Settings component={PipelineSettings} configCode="remainderConfig" />;
};

const SyncHistoryListComponent = () => {
  const location = useLocation()

  return (
    <SyncHistoryList
      queryParams={queryString.parse(location.search)}
    />
  );
};

const CheckSyncedDealList = () => {
  const location = useLocation()

  return (
    <CheckSyncedDeals
      queryParams={queryString.parse(location.search)}
    />
  );
};

const CheckSyncedOrderList = () => {
  const location = useLocation()

  return (
    <CheckSyncedOrders
      queryParams={queryString.parse(location.search)}
    />
  );
};

const InventoryProductList = () => {
  const location = useLocation()

  return (
    <InventoryProducts
      queryParams={queryString.parse(location.search)}
    />
  );
};

const InventoryCategoryList = () => {
  const location = useLocation()

  return (
    <InventoryCategory
      queryParams={queryString.parse(location.search)}
    />
  );
};
const routes = () => {
  return (
    <Routes>
      <Route
        key="/erxes-plugin-multi-erkhet/settings/general"
        path="/erxes-plugin-multi-erkhet/settings/general"
        element={<GeneralSetting/>}
      />

      <Route
        key="/erxes-plugin-multi-erkhet/settings/stage"
        path="/erxes-plugin-multi-erkhet/settings/stage"
        element={<StageSetting/>}
      />

      <Route
        key="/erxes-plugin-multi-erkhet/settings/return-stage"
        path="/erxes-plugin-multi-erkhet/settings/return-stage"
        element={<ReturnStageSetting/>}
      />

      <Route
        key="/erxes-plugin-multi-erkhet/settings/pipeline"
        path="/erxes-plugin-multi-erkhet/settings/pipeline"
        element={<PipelineSetting/>}
      />

      <Route
        key="/multi-erkhet-history"
        path="/multi-erkhet-history"
        element={<SyncHistoryListComponent/>}
      />

      <Route
        key="/check-multi-synced-deals"
        path="/check-multi-synced-deals"
        element={<CheckSyncedDealList/>}
      />

      <Route
        key="/check-multi-pos-orders"
        path="/check-multi-pos-orders"
        element={<CheckSyncedOrderList/>}
      />

      <Route
        key="/multi-inventory-products"
        path="/multi-inventory-products"
        element={<InventoryProductList/>}
      />

      <Route
        key="/multi-inventory-category"
        path="/multi-inventory-category"
        element={<InventoryCategoryList/>}
      />
    </Routes>
  );
};

export default routes;
