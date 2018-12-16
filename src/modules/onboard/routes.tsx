import queryString from 'query-string';
import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { GettingStart, Welcome } from './components';

const index = () => {
  return <Redirect to="/welcome" />;
};

const routes = () => {
  return (
    <React.Fragment>
      <Route exact={true} path="/" key="index" render={index} />
      <Route exact={true} key="/welcome" path="/welcome" component={Welcome} />
      <Route
        exact={true}
        key="/getting-started"
        path="/getting-started"
        component={GettingStart}
      />
    </React.Fragment>
  );
};

export default routes;
