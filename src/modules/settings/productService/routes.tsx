import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { List } from './containers';

const routes = () => (
  <Route
    path="/settings/product-service/"
    component={({ location }) => {
      return <List queryParams={queryString.parse(location.search)} />;
    }}
  />
);

export default routes;
