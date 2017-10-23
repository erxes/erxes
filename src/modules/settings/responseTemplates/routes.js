import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../../layout/components';
import { List } from './containers';

const routes = () => (
  <Route
    path="/settings/response-templates/"
    component={() => {
      return <MainLayout content={<List queryParams={{}} />} />;
    }}
  />
);

export default routes;
