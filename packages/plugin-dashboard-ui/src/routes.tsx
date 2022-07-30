import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

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
        key="/dashboards"
        exact={true}
        path="/dashboards"
        component={dashboardList}
      />
      <Route
        key="/dashboards/details"
        exact={true}
        path="/dashboards/details/:id"
        component={dashboardDetail}
      />
    </>
  );
};

export default routes;
