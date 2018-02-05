import React from 'react';
import { Route } from 'react-router-dom';
import {
  VolumeReport,
  ResponseReport,
  FirstResponse,
  ResponseCloseReport,
  Reports
} from './containers';
import { InsightPage } from './components';

const routes = () => [
  <Route
    key="/insights/response-report"
    exact
    path="/insights/response-report"
    component={() => {
      return <Reports component={ResponseReport} />;
    }}
  />,

  <Route
    key="/insights/response-close-report"
    exact
    path="/insights/response-close-report"
    component={() => {
      return <Reports component={ResponseCloseReport} />;
    }}
  />,

  <Route
    key="/insights/first-response"
    exact
    path="/insights/first-response"
    component={() => {
      return <Reports component={FirstResponse} />;
    }}
  />,

  <Route
    key="/insights/volume-report"
    exact
    path="/insights/volume-report"
    component={() => {
      return <Reports component={VolumeReport} />;
    }}
  />,

  <Route key="/insights" exact path="/insights" component={InsightPage} />
];

export default routes;
