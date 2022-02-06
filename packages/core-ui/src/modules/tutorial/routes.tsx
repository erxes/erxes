import React from 'react';
import { Route } from 'react-router-dom';
import Tutorial from './components/Tutorial';

const routes = () => {
  return (
    <Route key="/tutorial" exact={true} path="/tutorial" render={Tutorial} />
  );
};

export default routes;
