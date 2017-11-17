import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import { MainLayout } from '../layout/containers';
import {
  VolumeReport,
  ResponseReport,
  FirstResponse,
  ResponseCloseReport
} from './containers';

const routes = () => [
  <Route
    key="/insights/response-report"
    exact
    path="/insights/response-report"
    component={({ history, location }) => {
      const queryParams = queryString.parse(location.search);
      return (
        <MainLayout
          content={
            <ResponseReport history={history} queryParams={queryParams} />
          }
        />
      );
    }}
  />,

  <Route
    key="/insights/response-close-report"
    exact
    path="/insights/response-close-report"
    component={({ history, location }) => {
      const queryParams = queryString.parse(location.search);
      return (
        <MainLayout
          content={
            <ResponseCloseReport history={history} queryParams={queryParams} />
          }
        />
      );
    }}
  />,

  <Route
    key="/insights/first-response"
    exact
    path="/insights/first-response"
    component={({ history, location }) => {
      const queryParams = queryString.parse(location.search);
      return (
        <MainLayout
          content={
            <FirstResponse history={history} queryParams={queryParams} />
          }
        />
      );
    }}
  />,

  <Route
    key="/insights"
    exact
    path="/insights"
    component={({ history, location }) => {
      const queryParams = queryString.parse(location.search);
      return (
        <MainLayout
          content={<VolumeReport history={history} queryParams={queryParams} />}
        />
      );
    }}
  />
];

export default routes;
