import React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const Store = asyncComponent(() =>
  import(
    /* webpackChunkName: "Store" */ './containers/Store'
  )
);

const PluginDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "Store" */ './containers/PluginDetails'
  )
);

const main = () => {
  return <Store text="fjfhkjnn" />; // change props
};

const detail = ({ match }) => {
  const id = match.params.id;

  return <PluginDetails id={id} />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/store/details"
        exact={true}
        path="/store/details"
        component={detail}
      />

      <Route
        path="/store"
        exact={true}
        key="/store"
        component={main}
      />
    </React.Fragment>
  );
};

export default routes;
