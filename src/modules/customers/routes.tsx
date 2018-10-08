import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { CustomerDetails, CustomersList } from './containers';

const routes = () => (
  <React.Fragment>
    <Route
      key="/customers/details/:id"
      exact
      path="/customers/details/:id"
      component={({ match, location }) => {
        const queryParams = queryString.parse(location.search);
        const id = match.params.id;

        return <CustomerDetails id={id} queryParams={queryParams} />;
      }}
    />

    <Route
      key="/customers"
      exact
      path="/customers"
      component={({ location }) => {
        const queryParams = queryString.parse(location.search);
        return <CustomersList queryParams={queryParams} location={location} />;
      }}
    />
  </React.Fragment>
);

export default routes;
