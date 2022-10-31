import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';

const AssetList = asyncComponent(() =>
  import(/* webpackChunkName: "List - Assets" */ './asset/containers/List')
);

const AssetMovements = asyncComponent(() =>
  import(/* webpackChunkName: "List - Assets" */ './movements/containers/List')
);

const AssetMovementItems = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Asset Movement Item" */ './movements/items/containers/List'
  )
);

const AssetDetail = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Assets" */ './asset/detail/containers/Detail'
  )
);

const assets = ({ history, location }) => {
  return (
    <AssetList
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const detail = ({ history, location, match }) => {
  const id = match.params.id;

  return (
    <AssetDetail
      history={history}
      queryParams={queryString.parse(location.search)}
      id={id}
    />
  );
};

const movements = props => {
  return (
    <AssetMovements
      {...props}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const movementItems = props => {
  return (
    <AssetMovementItems
      {...props}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/settings/assets/" exact component={assets} />
      <Route
        path="/settings/assets/detail/:id"
        exact={true}
        key="/settings/assets/detail/:id"
        component={detail}
      />
      <Route path="/asset-movements" exact={true} component={movements} />
      <Route
        path="/asset-movement-items"
        exact={true}
        component={movementItems}
      />
    </React.Fragment>
  );
};

export default routes;
