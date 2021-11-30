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
  import(/* webpackChunkName: "Engage configs" */ './components/EngageConfigs')
);

const Theme = asyncComponent(() =>
  import(/* webpackChunkName: "Theme" */ './containers/Theme')
);

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/settings/general/" component={GeneralSettings} />
      <Route
        path="/settings/integration-configs/"
        component={IntegrationConfigs}
      />

      <Route path="/settings/campaign-configs/" component={EngageConfigs} />
      <Route path="/settings/theme/" component={Theme} />
    </React.Fragment>
  );
};

export default routes;
