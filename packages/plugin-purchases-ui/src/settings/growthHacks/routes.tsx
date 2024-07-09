import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { options } from './options';

const Home = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - Board Home" */ '../boards/containers/Home'
    ),
);

const GrowthHackHome = () => {
  return <Home type="growthHack" title="Growth hacking" options={options} />;
};

const TemplateList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - List PipelineTemplate" */ './containers/TemplateList'
    ),
);

const PipelineTemplates = () => {
  const location = useLocation();

  return <TemplateList queryParams={queryString.parse(location.search)} />;
};

const routes = () => (
  <Routes>
    <Route path="/settings/boards/growthHack" element={<GrowthHackHome />} />

    <Route
      path="/settings/boards/growthHackTemplate"
      element={<PipelineTemplates />}
    />
  </Routes>
);

export default routes;
