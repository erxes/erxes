import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../../layout/containers';
import { UserList } from './containers';

const routes = () => (
  <Route
    path="/settings/team/"
    component={() => {
      return <MainLayout content={<UserList queryParams={{}} />} />;
    }}
  />
);

export default routes;
