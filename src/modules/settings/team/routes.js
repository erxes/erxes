import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { UserList } from './containers';

const routes = () => (
  <Route
    path="/settings/team/"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return <UserList queryParams={queryParams} />;
    }}
  />
);

export default routes;
