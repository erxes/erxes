import * as React from 'react';
import { Route } from 'react-router-dom';
import asyncComponent from './components/AsyncComponent';

const AsyncVolumeAndResponseReport = asyncComponent(() =>
  import('./containers/VolumeAndResponseReport')
);

const AsyncFirstAndCloseResponseReport = asyncComponent(() =>
  import('./containers/FirstAndCloseResponseReport')
);

const AsyncReports = asyncComponent(() => import('./containers/Reports'));

const AsyncInsightPage = asyncComponent(() =>
  import('./components/InsightPage')
);

const routes = () => (
  <React.Fragment>
    <Route
      key="/insights/response-report"
      exact={true}
      path="/insights/response-report"
      component={() => {
        return (
          <AsyncReports
            type="response"
            component={AsyncVolumeAndResponseReport}
          />
        );
      }}
    />

    <Route
      key="/insights/response-close-report"
      exact={true}
      path="/insights/response-close-report"
      component={() => {
        return (
          <AsyncReports
            type="close"
            component={AsyncFirstAndCloseResponseReport}
          />
        );
      }}
    />

    <Route
      key="/insights/first-response"
      exact={true}
      path="/insights/first-response"
      component={() => {
        return (
          <AsyncReports
            type="first"
            component={AsyncFirstAndCloseResponseReport}
          />
        );
      }}
    />

    <Route
      key="/insights/volume-report"
      exact={true}
      path="/insights/volume-report"
      component={() => {
        return (
          <AsyncReports
            type="volume"
            component={AsyncVolumeAndResponseReport}
          />
        );
      }}
    />

    <Route
      key="/insights"
      exact={true}
      path="/insights"
      component={AsyncInsightPage}
    />
  </React.Fragment>
);

export default routes;
