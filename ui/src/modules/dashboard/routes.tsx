import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const Dashboard = asyncComponent(() =>
  import(/* webpackChunkName: "Dashboards" */ './components/Home')
);

const DashboardDetail = asyncComponent(() =>
  import(/* webpackChunkName: "Dashboards" */ './components/DashboardDetail')
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
        key="/detail"
        exact={true}
        path="/dashboard/details/:id"
        component={dashboardDetail}
      />
    </React.Fragment>
  );
};

export default routes;
