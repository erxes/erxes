import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const ClientPortal = asyncComponent(() =>
  import(
    /* webpackChunkName: "ClientPortal - Settings" */ './containers/ClientPortal'
  )
);

const routes = () => (
  <Route path="/settings/client-portal/" component={ClientPortal} />
);

export default routes;
