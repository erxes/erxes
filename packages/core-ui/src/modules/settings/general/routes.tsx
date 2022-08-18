import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from 'modules/common/components/AsyncComponent';

const GeneralSettings = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - General" */ './containers/GeneralSettings'
  )
);

const Theme = asyncComponent(() =>
  import(/* webpackChunkName: "Theme" */ './containers/Theme')
);

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/settings/general/" component={GeneralSettings} />
      <Route path="/settings/theme/" component={Theme} />
    </React.Fragment>
  );
};

export default routes;
