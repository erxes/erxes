import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import options from './options';

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Board Home" */ 'modules/settings/boards/containers/Home')
);

const TemplateHome = () => {
  return (
    <Home
      type="growthHackTemplate"
      title="Growth hack templates"
      options={options}
    />
  );
};

const routes = () => (
  <React.Fragment>
    <Route
      path="/settings/boards/growthHackTemplate"
      component={TemplateHome}
    />
  </React.Fragment>
);

export default routes;
