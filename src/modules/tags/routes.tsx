import * as React from 'react';
import { Route } from 'react-router-dom';
import { List } from './containers';

const routes = () => (
  <Route
    path="/tags/:type"
    component={({ match }) => {
      return <List type={match.params.type} />;
    }}
  />
);

export default routes;
