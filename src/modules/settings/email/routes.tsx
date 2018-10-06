import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { List, Signature } from './containers';

const routes = () => (
  <React.Fragment>
    <Route
      key="/settings/emails/"
      exact
      path="/settings/emails/"
      component={({ location }) => {
        return <List queryParams={queryString.parse(location.search)} />;
      }}
    />

    <Route
      key="/settings/emails/signatures"
      exact
      path="/settings/emails/signatures"
      component={({ location }) => {
        return <Signature queryParams={queryString.parse(location.search)} />;
      }}
    />
  </React.Fragment>
);

export default routes;
