import React from 'react';
import { Route } from 'react-router-dom';
import {
  VolumeAndReponseReport,
  FirstAndCloseResponseReport,
  Reports
} from './containers';
import { InsightPage } from './components';

const routes = () => [
  <Route
    key="/insights/response-report"
    exact
    path="/insights/response-report"
    component={() => {
      return <Reports type="response" component={VolumeAndReponseReport} />;
    }}
  />,

  <Route
    key="/insights/response-close-report"
    exact
    path="/insights/response-close-report"
    component={() => {
      return <Reports type="close" component={FirstAndCloseResponseReport} />;
    }}
  />,

  <Route
    key="/insights/first-response"
    exact
    path="/insights/first-response"
    component={() => {
      return <Reports type="first" component={FirstAndCloseResponseReport} />;
    }}
  />,

  <Route
    key="/insights/volume-report"
    exact
    path="/insights/volume-report"
    component={() => {
      return <Reports type="volume" component={VolumeAndReponseReport} />;
    }}
  />,

  <Route key="/insights" exact path="/insights" component={InsightPage} />
];

export default routes;
