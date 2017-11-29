import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { CustomersList, CustomerDetails } from './containers';

const routes = () => [
  <Route
    key="/customers/details/:id"
    exact
    path="/customers/details/:id"
    component={({ match, location }) => {
      const queryParams = queryString.parse(location.search);
      const id = match.params.id;

      return <CustomerDetails id={id} queryParams={queryParams} />;
    }}
  />,

  <Route
    key="/customers"
    exact
    path="/customers"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return <CustomersList queryParams={queryParams} />;
    }}
  />
];

export default routes;
