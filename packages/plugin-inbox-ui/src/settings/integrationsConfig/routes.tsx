import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const IntegrationsConfig = asyncComponent(() =>
  import(
    /* webpackChunkName: "IntegrationConfigs - Settings" */ './containers/IntegrationConfigs'
  )
);

const routes = () => (
  <Route path="/settings/add-ons-config/" component={IntegrationsConfig} />
);

export default routes;
