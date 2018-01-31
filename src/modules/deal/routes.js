import React from 'react';
import { Route } from 'react-router-dom';
import { Home } from './containers';

const routes = () => [
  <Route key="/deal/home" exact path="/deal" component={Home} />
];

export default routes;
