import React from 'react';
import { Route } from 'react-router-dom';
import { Settings } from './components';

const routes = () => [
  <Route key="/settings" exact path="/settings" component={Settings} />
];

export default routes;
