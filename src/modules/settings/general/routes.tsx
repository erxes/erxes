import * as React from 'react';
import { Route } from 'react-router-dom';
import { List } from './containers';

const general = () => {
  return <List />;
};

const routes = () => <Route path="/settings/general/" component={general} />;

export default routes;
