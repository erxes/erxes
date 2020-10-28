import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const GeneralSettings = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - General" */ './containers/GeneralSettings'
  )
);

const IntegrationConfigs = asyncComponent(() =>
  import(
    /* webpackChunkName: "Integration configs" */ './containers/IntegrationConfigs'
  )
);

const EngageConfigs = asyncComponent(() =>
  import(
    /* webpackChunkName: "Integration configs" */ './components/EngageConfigs'
  )
);

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/settings/general/" component={GeneralSettings} />
      <Route
        path="/settings/integration-configs/"
        component={IntegrationConfigs}
      />
      <Route path="/settings/engage-configs/" component={EngageConfigs} />
    </React.Fragment>
  );
};

export default routes;
