import * as React from 'react';
import { Route } from 'react-router-dom';
import { Settings } from './components';

const routes = () => (
  <Route exact={true} path="/settings" component={Settings} />
);

export default routes;
