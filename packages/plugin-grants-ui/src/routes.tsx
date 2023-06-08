import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';

const GrantRequest = asyncComponent(() =>
  import(/* webpackChunkName: "List - Request" */ './requests/containers/List')
);

const GrantConfigs = asyncComponent(() =>
  import(/* webpackChunkName: "List - Configs" */ './configs/containers/List')
);

const requests = ({ history, location }) => {
  return (
    <GrantRequest
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const configs = ({ history, location }) => {
  return (
    <GrantConfigs
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/grants/requests" exact component={requests} />
      <Route path="/settings/grants-configs" exact component={configs} />
    </React.Fragment>
  );
};

export default routes;
