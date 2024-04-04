import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from 'modules/common/components/AsyncComponent';

const GeneralSettings = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - General" */ './containers/GeneralSettings'
  )
);

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/settings/general/" component={GeneralSettings} />
    </React.Fragment>
  );
};

export default routes;
