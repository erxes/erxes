import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import queryString from 'query-string';
import { Inbox } from '../inbox/containers';

const routes = () => [
  <Route exact path="/" key="index" render={() => <Redirect to="/inbox" />} />,
  <Route
    exact
    key="inbox"
    path="/inbox"
    component={({ history, location }) => {
      const queryParams = queryString.parse(location.search);

      return <Inbox queryParams={queryParams} history={history} />;
    }}
  />
];

export default routes;
