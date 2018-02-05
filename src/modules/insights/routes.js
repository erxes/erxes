import React from 'react';
import { Route } from 'react-router-dom';
import queryString from 'query-string';
import {
  VolumeReport,
  ResponseReport,
  FirstResponse,
  ResponseCloseReport
} from './containers';
import { InsightPage } from './components';

const routes = () => [
  <Route
    key="/insights/response-report"
    exact
    path="/insights/response-report"
    component={({ history, location }) => {
      const queryParams = queryString.parse(location.search);
      return <ResponseReport history={history} queryParams={queryParams} />;
    }}
  />,

  <Route
    key="/insights/response-close-report"
    exact
    path="/insights/response-close-report"
    component={({ history, location }) => {
      const queryParams = queryString.parse(location.search);
      return (
        <ResponseCloseReport history={history} queryParams={queryParams} />
      );
    }}
  />,

  <Route
    key="/insights/first-response"
    exact
    path="/insights/first-response"
    component={({ history, location }) => {
      const queryParams = queryString.parse(location.search);
      return <FirstResponse history={history} queryParams={queryParams} />;
    }}
  />,

  <Route
    key="/insights/volume-report"
    exact
    path="/insights/volume-report"
    component={({ history, location }) => {
      const queryParams = queryString.parse(location.search);
      return <VolumeReport history={history} queryParams={queryParams} />;
    }}
  />,

  <Route key="/insights" exact path="/insights" component={InsightPage} />
];

export default routes;
