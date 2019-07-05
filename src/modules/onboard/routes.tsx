import asyncComponent from 'modules/common/components/AsyncComponent';
import React from 'react';
import { Route } from 'react-router-dom';

const GettingStart = asyncComponent(() =>
  import(/* webpackChunkName: "GettingStart" */ './containers/GettingStart')
);

const routes = () => {
  return (
    <Route
      exact={true}
      key="/getting-started"
      path="/getting-started"
      component={GettingStart}
    />
  );
};

export default routes;
