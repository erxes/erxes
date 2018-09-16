import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { NotificationList } from './containers';

const routes = () => (
  <Route
    path="/notifications"
    exact
    key="/notifications"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return <NotificationList queryParams={queryParams} />;
    }}
  />
);

export default routes;
