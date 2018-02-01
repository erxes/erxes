import React from 'react';
import { Route } from 'react-router-dom';
import { Home } from './containers';

const routes = () => [
  <Route key="/deals/home" exact path="/deals" component={Home} />
];

export default routes;
