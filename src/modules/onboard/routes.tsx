import queryString from 'query-string';
import * as React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { CreateBrand, Welcome } from './components';

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
        key="/create-brand"
        path="/create-brand"
        component={CreateBrand}
      />
    </React.Fragment>
  );
};

export default routes;
