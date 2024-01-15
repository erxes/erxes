import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import GeneralSettings from './settings/components/GeneralSettings';

const List = asyncComponent(() =>
  import(
    /* webpackChunkName: "List - Syncpolariss" */ './polaris/containers/List'
  )
);
const Settings = asyncComponent(() =>
  import(/* webpackChunkName: "Settings" */ './settings/containers/Settings')
);
const syncpolariss = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <List typeId={type} history={history} />;
};

const GeneralSetting = () => {
  return <Settings component={GeneralSettings} configCode="POLARIS" />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/syncpolariss/" component={syncpolariss} />;
      <Route
        key="/erxes-plugin-polaris-polaris/settings/general"
        exact={true}
        path="/erxes-plugin-sync-polaris/settings/general"
        component={GeneralSetting}
      />
    </React.Fragment>
  );
};

export default routes;
