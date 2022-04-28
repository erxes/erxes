import React from 'react';
import { Route } from 'react-router-dom';

import asyncComponent from 'modules/common/components/AsyncComponent';

const Apps = asyncComponent(() =>
  import(/* webpackChunkName: "Apps - Settings" */ './containers/AppListContainer')
);

const routes = () => <Route path="/settings/apps/" component={Apps} />;

export default routes;
