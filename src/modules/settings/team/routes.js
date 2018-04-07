import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { UserList } from './containers';
import { UserDetails } from './containers';

const routes = () => [
  <Route
    path="/settings/team/"
    exact
    key="/settings/team/"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return <UserList queryParams={queryParams} />;
    }}
  />,
  <Route
    key="/settings/team/details/:id"
    exact
    path="/settings/team/details/:id"
    component={({ match, location }) => {
      const queryParams = queryString.parse(location.search);
      const id = match.params.id;

      return <UserDetails id={id} queryParams={queryParams} />;
    }}
  />
];

export default routes;
