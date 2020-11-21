import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Dashboard = asyncComponent(() =>
  import(/* webpackChunkName: "Dashboards" */ './containers/Home')
);

const DashboardDetail = asyncComponent(() =>
  import(/* webpackChunkName: "Dashboards" */ './containers/DashboardDetail')
);

const InitialData = asyncComponent(() =>
  import(/* webpackChunkName: "InitialData" */ './components/InitialData')
);

const Dashboards = ({ location, history }) => {
  return (
    <Dashboard
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const dashboardDetail = ({ match, history }) => {
  const id = match.params.id;

  return <DashboardDetail id={id} history={history} />;
};

const dashboardExplore = ({ match, history }) => {
  const dashboardId = match.params.id;

  return (
    <DashboardDetail id={dashboardId} history={history} isExplore={true} />
  );
};

const initialData = ({ location, match, history }) => {
  const dashboardId = match.params.id;

  return (
    <InitialData
      dashboardId={dashboardId}
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route
        key="/dashboard"
        exact={true}
        path="/dashboard"
        component={Dashboards}
      />
      <Route
        key="/dashboard/detail"
        exact={true}
        path="/dashboard/:id"
        component={dashboardDetail}
      />
      <Route
        key="/dashboard/reports"
        exact={true}
        path="/dashboard/reports/:id"
        component={initialData}
      />
      <Route
        key="/dashboard/explore"
        exact={true}
        path="/dashboard/explore/:id"
        component={dashboardExplore}
      />
    </>
  );
};

export default routes;
