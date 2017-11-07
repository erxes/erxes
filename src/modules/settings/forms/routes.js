import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../../layout/containers';
import { List } from './containers';

const routes = () => (
  <Route
    path="/settings/forms/"
    component={({ location }) => {
      return (
        <MainLayout
          content={<List queryParams={queryString.parse(location.search)} />}
        />
      );
    }}
  />
);

export default routes;
