import React from 'react';
import { Route } from 'react-router-dom';
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

const syncHistoryList = ({ location, history }) => {
  return (
    <SyncHistoryList
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const checkSyncedDealList = ({ location, history }) => {
  return (
    <CheckSyncedDeals
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const CheckSyncedOrderList = ({ location, history }) => {
  return (
    <CheckSyncedOrders
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const InventoryProductList = ({ location, history }) => {
  return (
    <InventoryProducts
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const InventoryCategoryList = ({ location, history }) => {
  return (
    <InventoryCategory
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};
const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/erxes-plugin-sync-erkhet/settings/general"
        exact={true}
        path="/erxes-plugin-sync-erkhet/settings/general"
        component={GeneralSetting}
      />

      <Route
        key="/erxes-plugin-sync-erkhet/settings/stage"
        exact={true}
        path="/erxes-plugin-sync-erkhet/settings/stage"
        component={StageSetting}
      />

      <Route
        key="/erxes-plugin-sync-erkhet/settings/move-stage"
        exact={true}
        path="/erxes-plugin-sync-erkhet/settings/move-stage"
        component={StageMoveSetting}
      />

      <Route
        key="/erxes-plugin-sync-erkhet/settings/income-stage"
        exact={true}
        path="/erxes-plugin-sync-erkhet/settings/income-stage"
        component={StageIncomeSetting}
      />

      <Route
        key="/erxes-plugin-sync-erkhet/settings/return-stage"
        exact={true}
        path="/erxes-plugin-sync-erkhet/settings/return-stage"
        component={ReturnStageSetting}
      />

      <Route
        key="/erxes-plugin-sync-erkhet/settings/pipeline"
        exact={true}
        path="/erxes-plugin-sync-erkhet/settings/pipeline"
        component={PipelineSetting}
      />

      <Route
        key="/sync-erkhet-history"
        exact={true}
        path="/sync-erkhet-history"
        component={syncHistoryList}
      />

      <Route
        key="/check-synced-deals"
        exact={true}
        path="/check-synced-deals"
        component={checkSyncedDealList}
      />

      <Route
        key="/check-pos-orders"
        exact={true}
        path="/check-pos-orders"
        component={CheckSyncedOrderList}
      />

      <Route
        key="/inventory-products"
        exact={true}
        path="/inventory-products"
        component={InventoryProductList}
      />

      <Route
        key="/inventory-category"
        exact={true}
        path="/inventory-category"
        component={InventoryCategoryList}
      />
    </React.Fragment>
  );
};

export default routes;
