import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import options from './options';

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Board Home" */ 'modules/settings/boards/containers/Home')
);

const GrowthHackHome = () => {
  return <Home type="growthHack" title="Growth hack" options={options} />;
};

const routes = () => (
  <React.Fragment>
    <Route path="/settings/boards/growthHack" component={GrowthHackHome} />
  </React.Fragment>
);

export default routes;
