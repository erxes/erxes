import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { NotificationList } from './containers';

const notification = ({ location }) => {
  const queryParams = queryString.parse(location.search);
  return <NotificationList queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Route
      path="/notifications"
      exact={true}
      key="/notifications"
      component={notification}
    />
  );
};

export default routes;
