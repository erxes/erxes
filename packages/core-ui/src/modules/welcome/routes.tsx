import React from 'react';
import { Route } from 'react-router-dom';
import Welcome from './container/Welcome';

const routes = () => {
  return (
    <Route key="/welcome" exact={true} path="/welcome" component={Welcome} />
  );
};

export default routes;
