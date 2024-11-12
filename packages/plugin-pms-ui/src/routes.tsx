import Settings from './containers/Settings';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const PipelineSettings = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "PipelineSettings" */ './components/RemPipelineSettings'
    )
);

const PipelineSetting = () => {
  return <Settings component={PipelineSettings} configCode='remainderConfig' />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        key='/settings/pms/general'
        path='/settings/pms/general'
        element={<PipelineSetting />}
      />
    </Routes>
  );
};

export default routes;
