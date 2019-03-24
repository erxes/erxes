import asyncComponent from 'modules/common/components/AsyncComponent';
import * as React from 'react';
import { Route } from 'react-router-dom';

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Deal Home" */ './containers/Home')
);

const routes = () => <Route path="/settings/deals/" component={Home} />;

export default routes;
