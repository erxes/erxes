import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import GeneralSettings from './config/components/Settings';
const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Burenscorings" */ './containers/List')
);
const Settings = asyncComponent(
  () =>
    import(/* webpackChunkName: "Settings" */ './config/containers/Settings'),
);

const burenscorings = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <List typeId={type} history={history} />;
};

const GeneralSetting = () => {
  return <Settings component={GeneralSettings} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route 
        path="/burenscorings/" 
        component={burenscorings} 
        />;
      <Route
        path="/erxes-plugin-burenscoring/settings/general"
        component={GeneralSetting}
      />
    </React.Fragment>
  )
};

export default routes;
