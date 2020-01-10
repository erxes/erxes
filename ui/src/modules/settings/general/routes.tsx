import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "Settings List - General" */ './containers/List')
);

const IntegrationConfigs = asyncComponent(() =>
  import(/* webpackChunkName: "Integration configs" */ './containers/IntegrationConfigs')
);

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/settings/general/" component={List} />;
      <Route path="/settings/integration-configs/" component={IntegrationConfigs} />;
    </React.Fragment>
  )
};

export default routes;
