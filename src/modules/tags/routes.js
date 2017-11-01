import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../layout/containers';
import { List } from './containers';

const routes = () => (
  <Route
    path="/tags/:type"
    component={({ match }) => {
      return <MainLayout content={<List type={match.params.type} />} />;
    }}
  />
);

export default routes;
