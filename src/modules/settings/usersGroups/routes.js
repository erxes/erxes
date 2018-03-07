import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { GroupList } from './containers';

const routes = () => (
  <Route
    path="/settings/users/groups/"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return <GroupList queryParams={queryParams} />;
    }}
  />
);

export default routes;
