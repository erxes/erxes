import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';
import { options, templateOptions } from './options';

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Board Home" */ 'modules/settings/boards/containers/Home')
);

const GrowthHackHome = () => {
  return <Home type="growthHack" title="Growth hack" options={options} />;
};

const GrowthHackTemplateHome = () => {
  return (
    <Home
      type="growthHackTemplate"
      title="Growth hack template"
      options={templateOptions}
    />
  );
};

const routes = () => (
  <React.Fragment>
    <Route path="/settings/boards/growthHack" component={GrowthHackHome} />
    <Route
      path="/settings/boards/growthHackTemplate"
      component={GrowthHackTemplateHome}
    />
  </React.Fragment>
);

export default routes;
