import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

import { getEnv } from '@erxes/ui/src/utils';

const { REACT_APP_DASHBOARD_URL } = getEnv();

const DashboardList = asyncComponent(() =>
  import(/* webpackChunkName: "Dashboards" */ './containers/List')
);

const DashboardDetails = asyncComponent(() =>
  import(
    /* webpackChunkName: "Dashboards" */ './containers/dashboard/Dashboard'
  )
);

const dashboardList = ({ location, history }) => {
  return (
    <DashboardList
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const dashboardDetail = ({ match, location, history }) => {
  const id = match.params.id;

  return (
    <DashboardDetails
      id={id}
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
        component={dashboardList}
      />
      <Route
        key="/dashboard/details"
        exact={true}
        path="/dashboard/details/:id"
        component={dashboardDetail}
      />
    </>
  );
};

export default routes;
