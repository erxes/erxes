import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const Settings = asyncComponent(() =>
  import(/* webpackChunkName: "Settings List - Engages" */ './containers/Settings')
);

const routes = () => <Route path="/settings/engages/" component={Settings} />;

export default routes;
