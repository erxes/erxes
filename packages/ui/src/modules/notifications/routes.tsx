import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const NotificationList = asyncComponent(() =>
  import(
    /* webpackChunkName: "NotificationList" */ './containers/NotificationList'
  )
);

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
