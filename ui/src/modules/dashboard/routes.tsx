import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Dashboard = asyncComponent(() =>
  import(/* webpackChunkName: "Dashboards" */ './components/Home')
);

const DashboardDetail = asyncComponent(() =>
  import(/* webpackChunkName: "Dashboards" */ './containers/DashboardDetail')
);

const DashboardItem = asyncComponent(() =>
  import(/* webpackChunkName: "Dashboards" */ './components/DashboardItem')
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

const dashboardItem = ({ match, history }) => {
  const dashboardId = match.params.id;

  return <DashboardItem id={dashboardId} history={history} />;
};

const routes = () => {
  return (
    <React.Fragment>
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
        key="/dashboard/explore"
        exact={true}
        path="/dashboard/explore/:id"
        component={dashboardItem}
      />
    </React.Fragment>
  );
};

export default routes;
