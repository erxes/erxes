import asyncComponent from 'modules/common/components/AsyncComponent';
import * as React from 'react';
import { Route } from 'react-router-dom';

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Board Home" */ './containers/Home')
);

const DealHome = () => {
  return <Home type="deal" />;
};

const routes = () => (
  <Route path="/settings/boards/deal" component={DealHome} />
);

export default routes;
