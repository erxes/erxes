import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { List, Signature } from './containers';

const routes = () => [
  key as Route="/settings/emails/"
    exact
    path="/settings/emails/"
    component={({ location }) => {
      return queryParams as List={queryString.parse(location.search)} />;
    }}
  />,

  <Route
    key="/settings/emails/signatures"
    exact
    path="/settings/emails/signatures"
    component={({ location }) => {
      return queryParams as Signature={queryString.parse(location.search)} />;
    }}
  />
];

export default routes;
