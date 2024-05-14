import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import GeneralSettings from './components/GeneralSettings';
import StageSettings from './components/StageSettings';
import StageMoveSettings from './components/StageMoveSettings';
import StageIncomeSettings from './components/StageIncomeSettings';
import ReturnStageSettings from './components/ReturnStageSettings';
import PipelineSettings from './components/PipelineSettings';

const Settings = asyncComponent(() =>
  import(/* webpackChunkName: "Settings" */ './containers/Settings')
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
  return <Settings component={GeneralSettings} configCode="ERKHET" />;
};

const StageSetting = () => {
  return <Settings component={StageSettings} configCode="ebarimtConfig" />;
};

const StageMoveSetting = () => {
  return (
    <Settings component={StageMoveSettings} configCode="stageInMoveConfig" />
  );
};

const StageIncomeSetting = () => {
  return (
    <Settings
      component={StageIncomeSettings}
      configCode="stageInIncomeConfig"
    />
  );
};

const ReturnStageSetting = () => {
  return (
    <Settings
      component={ReturnStageSettings}
      configCode="returnEbarimtConfig"
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
        key="/erxes-plugin-sync-erkhet/settings/general"
        path="/erxes-plugin-sync-erkhet/settings/general"
        element={<GeneralSetting/>}
      />

      <Route
        key="/erxes-plugin-sync-erkhet/settings/stage"
        path="/erxes-plugin-sync-erkhet/settings/stage"
        element={<StageSetting/>}
      />

      <Route
        key="/erxes-plugin-sync-erkhet/settings/move-stage"
        path="/erxes-plugin-sync-erkhet/settings/move-stage"
        element={<StageMoveSetting/>}
      />

      <Route
        key="/erxes-plugin-sync-erkhet/settings/income-stage"
        path="/erxes-plugin-sync-erkhet/settings/income-stage"
        element={<StageIncomeSetting/>}
      />

      <Route
        key="/erxes-plugin-sync-erkhet/settings/return-stage"
        path="/erxes-plugin-sync-erkhet/settings/return-stage"
        element={<ReturnStageSetting/>}
      />

      <Route
        key="/erxes-plugin-sync-erkhet/settings/pipeline"
        path="/erxes-plugin-sync-erkhet/settings/pipeline"
        element={<PipelineSetting/>}
      />

      <Route
        key="/sync-erkhet-history"
        path="/sync-erkhet-history"
        element={<SyncHistoryListComponent/>}
      />

      <Route
        key="/check-synced-deals"
        path="/check-synced-deals"
        element={<CheckSyncedDealList/>}
      />

      <Route
        key="/check-pos-orders"
        path="/check-pos-orders"
        element={<CheckSyncedOrderList/>}
      />

      <Route
        key="/inventory-products"
        path="/inventory-products"
        element={<InventoryProductList/>}
      />

      <Route
        key="/inventory-category"
        path="/inventory-category"
        element={<InventoryCategoryList/>}
      />
    </Routes>
  );
};

export default routes;
