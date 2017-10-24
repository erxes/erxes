import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../layout/containers';
import { VolumeReport, ResponseReport, FirstResponse } from './containers';

const routes = () => [
  <Route
    key="/insights/response-report"
    exact
    path="/insights/response-report"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return (
        <MainLayout content={<ResponseReport queryParams={queryParams} />} />
      );
    }}
  />,

  <Route
    key="/insights/first-response"
    exact
    path="/insights/first-response"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return (
        <MainLayout content={<FirstResponse queryParams={queryParams} />} />
      );
    }}
  />,

  <Route
    key="/insights"
    exact
    path="/insights"
    component={({ location }) => {
      const queryParams = queryString.parse(location.search);
      return (
        <MainLayout content={<VolumeReport queryParams={queryParams} />} />
      );
    }}
  />
];

export default routes;
