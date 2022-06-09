import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import { Route } from 'react-router-dom';

const Settings = asyncComponent(() =>
  import(
    /* webpackChunkName: 'Salesplans - Settings' */ './containers/Settings'
  )
);

const routes = () => (
  <Route path="/settings/sales-plans" component={Settings} />
);

export default routes;
