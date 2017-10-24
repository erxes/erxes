import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../../layout/containers';
import { List } from './containers';

const routes = () => (
  <Route
    path="/settings/forms/"
    component={() => {
      return <MainLayout content={<List queryParams={{}} />} />;
    }}
  />
);

export default routes;
