import Settings from './containers/Settings';
import React from 'react';
import { Route } from 'react-router-dom';
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

const StageMoveSettings = asyncComponent(() =>
  import(
    /* webpackChunkName: "StageSettings" */ './components/MoveStageSettings'
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

const StageMoveSetting = () => {
  return (
    <Settings component={StageMoveSettings} configCode="stageInMoveConfig" />
  );
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
        key="/erxes-plugin-multi-erkhet/settings/general"
        exact={true}
        path="/erxes-plugin-multi-erkhet/settings/general"
        component={GeneralSetting}
      />

      <Route
        key="/erxes-plugin-multi-erkhet/settings/stage"
        exact={true}
        path="/erxes-plugin-multi-erkhet/settings/stage"
        component={StageSetting}
      />

      <Route
        key="/erxes-plugin-multi-erkhet/settings/move-stage"
        exact={true}
        path="/erxes-plugin-multi-erkhet/settings/move-stage"
        component={StageMoveSetting}
      />

      <Route
        key="/erxes-plugin-multi-erkhet/settings/return-stage"
        exact={true}
        path="/erxes-plugin-multi-erkhet/settings/return-stage"
        component={ReturnStageSetting}
      />

      <Route
        key="/erxes-plugin-multi-erkhet/settings/pipeline"
        exact={true}
        path="/erxes-plugin-multi-erkhet/settings/pipeline"
        component={PipelineSetting}
      />

      <Route
        key="/multi-erkhet-history"
        exact={true}
        path="/multi-erkhet-history"
        component={syncHistoryList}
      />

      <Route
        key="/check-multi-synced-deals"
        exact={true}
        path="/check-multi-synced-deals"
        component={checkSyncedDealList}
      />

      <Route
        key="/check-multi-pos-orders"
        exact={true}
        path="/check-multi-pos-orders"
        component={CheckSyncedOrderList}
      />

      <Route
        key="/multi-inventory-products"
        exact={true}
        path="/multi-inventory-products"
        component={InventoryProductList}
      />

      <Route
        key="/multi-inventory-category"
        exact={true}
        path="/multi-inventory-category"
        component={InventoryCategoryList}
      />
    </React.Fragment>
  );
};

export default routes;
