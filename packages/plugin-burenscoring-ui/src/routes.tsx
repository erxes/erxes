import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import GeneralSettings from './config/components/Settings';
import queryString from 'query-string'

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Burenscorings" */ './containers/List')
);
const Settings = asyncComponent(
  () =>
    import(/* webpackChunkName: "Settings" */ './config/containers/Settings'),
);
const Burenscorings = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search)
  return <List queryParams = {queryParams} />;
};

const GeneralSetting = () => {
  return <Settings component={GeneralSettings} />;
};

const routes = () => {
  return (
    <Routes>
      <Route 
        key="/burenscorings" 
        path="/burenscorings"
        Component={Burenscorings}
        />;
      <Route
        key="/burenscorings"
        path="/erxes-plugin-burenscoring/config/Settings"
        Component = {GeneralSetting}
      />
    </Routes>
  )
};

export default routes;
