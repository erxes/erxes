import { Route } from 'react-router-dom';
import queryString from 'query-string';

import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';

const SettingsContainer = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings" */ 'modules/settings/containers/Settings'
  )
);

const Settings = ({ location }) => {
  const qp = queryString.parse(location.search);

  return <SettingsContainer qp={qp} />;
};

const routes = () => {
  if (localStorage.getItem('erxesPosMode')) {
    return <></>;
  }

  return (
    <React.Fragment>
      <Route
        key="/settings"
        exact={true}
        path="/settings"
        component={Settings}
      />
    </React.Fragment>
  );
};

export default routes;
