import asyncComponent from 'modules/common/components/AsyncComponent';
import * as React from 'react';
import { Route } from 'react-router-dom';

const Settings = asyncComponent(() =>
  import(/* webpackChunkName: "Settings" */ './components/Settings')
);

const routes = () => (
  <Route exact={true} path="/settings" component={Settings} />
);

export default routes;
