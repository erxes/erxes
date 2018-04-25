/* eslint-disable */
import React from 'react';
import { Route } from 'react-router-dom';
// import {
//   VolumeReport,
//   ResponseReport,
//   FirstResponse,
//   ResponseCloseReport,
//   Reports
// } from './containers';
// import { InsightPage } from './components';

import asyncComponent from 'modules/layout/components/AsyncComponent';

const AsyncVolumeReport = asyncComponent(() =>
  import('./containers/VolumeReport')
); // eslint-disable-line
const AsyncResponseReport = asyncComponent(() =>
  import('./containers/ResponseReport')
);
const AsyncFirstResponse = asyncComponent(() =>
  import('./containers/FirstResponse')
);
const AsyncResponseCloseReport = asyncComponent(() =>
  import('./containers/ResponseCloseReport')
);
const AsyncReports = asyncComponent(() => import('./containers/Reports'));
const AsyncInsightPage = asyncComponent(() =>
  import('./components/InsightPage')
);

const routes = () => [
  <Route
    key="/insights/response-report"
    exact
    path="/insights/response-report"
    component={() => {
      return <AsyncReports component={AsyncResponseReport} />;
    }}
  />,

  <Route
    key="/insights/response-close-report"
    exact
    path="/insights/response-close-report"
    component={() => {
      return <AsyncReports component={AsyncResponseCloseReport} />;
    }}
  />,

  <Route
    key="/insights/first-response"
    exact
    path="/insights/first-response"
    component={() => {
      return <AsyncReports component={AsyncFirstResponse} />;
    }}
  />,

  <Route
    key="/insights/volume-report"
    exact
    path="/insights/volume-report"
    component={() => {
      return <AsyncReports component={AsyncVolumeReport} />;
    }}
  />,

  <Route key="/insights" exact path="/insights" component={AsyncInsightPage} />
];

export default routes;
