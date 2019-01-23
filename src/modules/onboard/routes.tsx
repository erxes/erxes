import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { GettingStart } from './containers';

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
