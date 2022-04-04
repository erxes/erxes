import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const GeneralSettings = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings List - General" */ './containers/GeneralSettings'
  )
);

const Theme = asyncComponent(() =>
  import(/* webpackChunkName: "Theme" */ './containers/Theme')
);

const Installer = asyncComponent(() =>
  import(/* webpackChunkName: "Theme" */ './containers/Installer')
);

const routes = () => {
  return (
    <React.Fragment>
      <Route path="/settings/general/" component={GeneralSettings} />
      <Route path="/settings/theme/" component={Theme} />
      <Route path="/settings/installer/" component={Installer} />
    </React.Fragment>
  );
};

export default routes;
