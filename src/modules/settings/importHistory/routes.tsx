import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { Histories } from './containers';

const routes = () => (
  <Route
    path="/settings/importHistories/"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return <Histories queryParams={queryParams} />;
    }}
  />
);

export default routes;
