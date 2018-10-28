import * as React from 'react';
import { Route } from 'react-router-dom';
import { Status } from './containers';

const routes = () => (
  <Route exact={true} path="/settings/status/" component={Status} />
);

export default routes;
