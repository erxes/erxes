import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import { INSIGHT_TYPES } from './constants';

const AsyncExportReport = asyncComponent(() =>
  import(
    /* webpackChunkName: "AsyncExportReport" */ './containers/ExportReport'
  )
);

const AsyncConversationReport = asyncComponent(() =>
  import(
    /* webpackChunkName: "AsyncConversationReport" */ './containers/ConversationReport'
  )
);

const AsyncSummaryReport = asyncComponent(() =>
  import(
    /* webpackChunkName: "AsyncSummaryReport" */ './containers/SummaryReport'
  )
);

const AsyncVolumeAndResponseReport = asyncComponent(() =>
  import(
    /* webpackChunkName: "VolumeAndResponseReport" */ './containers/VolumeAndResponseReport'
  )
);

const AsyncFirstAndCloseResponseReport = asyncComponent(() =>
  import(
    /* webpackChunkName: "FirstAndCloseResponseReport" */ './containers/FirstAndCloseResponseReport'
  )
);

const AsyncReports = asyncComponent(() => import('./containers/Reports'));

const AsyncInsightPage = asyncComponent(() =>
  import('./components/InsightPage')
);

const AsyncDealVolumeReport = asyncComponent(() =>
  import(
    /* webpackChunkName: "DealVolumeReport" */ './containers/DealVolumeReport'
  )
);

const InboxInsightPage = () => {
  return <AsyncInsightPage type={INSIGHT_TYPES.INBOX} />;
};

const DealInsightPage = () => {
  return <AsyncInsightPage type={INSIGHT_TYPES.DEAL} />;
};

const responseReport = () => {
  return (
    <AsyncReports type="response" component={AsyncVolumeAndResponseReport} />
  );
};

const responseCloseReport = () => {
  return (
    <AsyncReports type="close" component={AsyncFirstAndCloseResponseReport} />
  );
};

const firstResponse = () => {
  return (
    <AsyncReports type="first" component={AsyncFirstAndCloseResponseReport} />
  );
};

const volumeReport = () => {
  return (
    <AsyncReports type="volume" component={AsyncVolumeAndResponseReport} />
  );
};

const summaryReport = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);

  return <AsyncSummaryReport queryParams={queryParams} history={history} />;
};

const exportReport = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);

  return <AsyncExportReport queryParams={queryParams} history={history} />;
};

const conversationReport = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);

  return (
    <AsyncConversationReport queryParams={queryParams} history={history} />
  );
};

const dealVolumeReport = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);

  return <AsyncDealVolumeReport queryParams={queryParams} history={history} />;
};

const dealWon = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);

  return (
    <AsyncDealVolumeReport
      queryParams={queryParams}
      history={history}
      status="Won"
    />
  );
};

const dealLost = ({ history, location }) => {
  const queryParams = queryString.parse(location.search);

  return (
    <AsyncDealVolumeReport
      queryParams={queryParams}
      history={history}
      status="Lost"
    />
  );
};

const routes = () => {
  return (
    <React.Fragment>
      <Route
        key="/inbox/insights/response-report"
        exact={true}
        path="/inbox/insights/response-report"
        component={responseReport}
      />

      <Route
        key="/inbox/insights/response-close-report"
        exact={true}
        path="/inbox/insights/response-close-report"
        component={responseCloseReport}
      />

      <Route
        key="/inbox/insights/first-response"
        exact={true}
        path="/inbox/insights/first-response"
        component={firstResponse}
      />

      <Route
        key="/inbox/insights/volume-report"
        exact={true}
        path="/inbox/insights/volume-report"
        component={volumeReport}
      />

      <Route
        key="/inbox/insights"
        exact={true}
        path="/inbox/insights"
        component={InboxInsightPage}
      />

      <Route
        key="/inbox/insights/summary-report"
        exact={true}
        path="/inbox/insights/summary-report"
        component={summaryReport}
      />

      <Route
        key="/inbox/insights/export-report"
        exact={true}
        path="/inbox/insights/export-report"
        component={exportReport}
      />

      <Route
        key="/inbox/insights/conversation-report"
        exact={true}
        path="/inbox/insights/conversation-report"
        component={conversationReport}
      />

      <Route
        key="/deal/insights"
        exact={true}
        path="/deal/insights"
        component={DealInsightPage}
      />

      <Route
        key="/deal/insights/volume-report"
        exact={true}
        path="/deal/insights/volume-report"
        component={dealVolumeReport}
      />

      <Route
        key="/deal/insights/won"
        exact={true}
        path="/deal/insights/won"
        component={dealWon}
      />

      <Route
        key="/deal/insights/lost"
        exact={true}
        path="/deal/insights/lost"
        component={dealLost}
      />
    </React.Fragment>
  );
};

export default routes;
