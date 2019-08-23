import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import { options, templateOptions } from './options';

const Home = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - Board Home" */ 'modules/settings/boards/containers/Home')
);

const GrowthHackHome = () => {
  return <Home type="growthHack" title="Growth hack" options={options} />;
};

const TemplateList = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - List PipelineTemplate" */ './containers/TemplateList')
);

const pipelineTemplates = ({ location }) => {
  return <TemplateList queryParams={queryString.parse(location.search)} />;
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
      component={pipelineTemplates}
    />
  </React.Fragment>
);

export default routes;
