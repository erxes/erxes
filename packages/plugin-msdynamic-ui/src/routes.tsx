import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';

const GeneralSettings = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Msdynamics" */ './containers/GeneralSettings'
  )
);

const SyncHistoryList = asyncComponent(() =>
  import(
    /* webpackChunkName: "CheckSyncedDeals" */ './containers/SyncHistoryList'
  )
);

const InventoryProducts = asyncComponent(() =>
  import(
    /* webpackChunkName: "InventoryProducts" */ './containers/InventoryProducts'
  )
);

const msdynamics = ({ history }) => {
  return <GeneralSettings history={history} />;
};

const syncHistoryList = ({ location, history }) => {
  return (
    <SyncHistoryList
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

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/msdynamics/" component={msdynamics} />

      <Route
        key="/sync-msdynamic-history"
        exact={true}
        path="/sync-msdynamic-history"
        component={syncHistoryList}
      />

      <Route
        key="/msdynamics-products"
        exact={true}
        path="/msdynamics-products"
        component={InventoryProductList}
      />
    </React.Fragment>
  );
};

export default routes;
