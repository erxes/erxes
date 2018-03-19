import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { Properties } from './containers';

const routes = () => (
  <Route
    path="/settings/properties/"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return <Properties queryParams={queryParams} />;
    }}
  />
);

export default routes;
