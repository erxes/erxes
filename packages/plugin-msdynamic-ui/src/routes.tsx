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

const InventoryCategory = asyncComponent(() =>
  import(
    /* webpackChunkName: "InventoryProducts" */ './containers/InventoryCategory'
  )
);
const Customers = asyncComponent(() =>
  import(/* webpackChunkName: "InventoryProducts" */ './containers/Customers')
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

const InventoryCategoryList = ({ location, history }) => {
  return (
    <InventoryCategory
      queryParams={queryString.parse(location.search)}
      history={history}
    />
  );
};

const CustomersList = ({ location, history }) => {
  return (
    <Customers
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
        key="/msdynamic-products"
        exact={true}
        path="/msdynamic-products"
        component={InventoryProductList}
      />

      <Route
        key="/msdynamic-category"
        exact={true}
        path="/msdynamic-category"
        component={InventoryCategoryList}
      />

      <Route
        key="/msdynamic-customers"
        exact={true}
        path="/msdynamic-customers"
        component={CustomersList}
      />
    </React.Fragment>
  );
};

export default routes;
