import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../layout/containers';
import { NotificationList } from './containers';

const routes = () => [
  <Route
    path="/notifications"
    exact
    key="/notifications"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return (
        <MainLayout content={<NotificationList queryParams={queryParams} />} />
      );
    }}
  />
];

export default routes;
