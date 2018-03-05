import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { PermissionList } from './containers';

const routes = () => (
  <Route
    path="/settings/permissions/"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return <PermissionList queryParams={queryParams} />;
    }}
  />
);

export default routes;
