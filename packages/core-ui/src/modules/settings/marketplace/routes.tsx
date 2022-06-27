import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const Installer = asyncComponent(() =>
  import(/* webpackChunkName: "Installer" */ './containers/Installer')
);

const PluginDetails = asyncComponent(() =>
  import(/* webpackChunkName: "Store" */ './containers/PluginDetails')
);

const detail = ({ match }) => {
  const id = match.params.id;

  return <PluginDetails id={id} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/settings/installer/details"
        exact={true}
        path="/settings/installer/details"
        component={detail}
      />

      <Route
        path="/settings/installer"
        exact={true}
        key="/settings/installer"
        component={Installer}
      />
    </React.Fragment>
  );
};

export default routes;
