import React from 'react';
import { Route } from 'react-router-dom';
import { Properties } from './containers';

const routes = () => (
  <Route path="/settings/properties/" component={Properties} />
);

export default routes;
