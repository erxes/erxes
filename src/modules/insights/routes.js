import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../layout/components';
import { VolumeReport, ResponseReport, FirstResponse } from './containers';

const routes = () => (
  <div>
    <Route
      path="/insights/response-report"
      component={({ location }) => {
        const queryParams = queryString.parse(location.search);
        return (
          <MainLayout content={<ResponseReport queryParams={queryParams} />} />
        );
      }}
    />

    <Route
      path="/insights/first-response"
      component={({ location }) => {
        const queryParams = queryString.parse(location.search);
        return (
          <MainLayout content={<FirstResponse queryParams={queryParams} />} />
        );
      }}
    />

    <Route
      path="/insights"
      component={({ location }) => {
        const queryParams = queryString.parse(location.search);
        return (
          <MainLayout content={<VolumeReport queryParams={queryParams} />} />
        );
      }}
    />
  </div>
);

export default routes;
