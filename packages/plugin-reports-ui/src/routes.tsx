import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import Report from './containers/report/Report';

const List = asyncComponent(
  () => import(/* webpackChunkName: "List - Reportss" */ './containers/List'),
);

const Insight = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Reportss" */ './containers/insight/List'
    ),
);

const Dashboard = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Reportss" */ './containers/insight/dashboard/List'
    ),
);

const Goal = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Reportss" */ './containers/insight/goal/Goal'
    ),
);

const Reports = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Reportss" */ './containers/insight/report/Report'
    ),
);

const insight = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  let component;

  if (queryParams.reportId) {
    component = Reports;
  } else if (queryParams.goalId) {
    component = Goal;
  } else if (queryParams.dashboardId) {
    component = Dashboard;
  } else {
    component = <>sda</>;
  }

  return (
    <Insight
      component={component}
      history={history}
      queryParams={queryParams}
    />
  );
};

const reports = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <List typeId={type} history={history} queryParams={queryParams} />;
};

const ReportForm = asyncComponent(
  () => import('./containers/report/ReportForm'),
);

const reportsDetail = ({ match, location, history }) => {
  const slug = match.params.slug;

  const queryParams = queryString.parse(location.search);

  const props = { reportId: slug, queryParams, history };

  if (slug === 'create-report') {
    return <ReportForm {...props} />;
  }

  return <Report {...props} />;
};

const routes = () => {
  return (
    <>
      <Route path="/reports" exact={true} component={reports} />

      <Route
        key="/reports/details/:slug"
        exact={true}
        path="/reports/details/:slug"
        component={reportsDetail}
      />

      <Route path="/insight" exact={true} component={insight} />
    </>
  );
};

export default routes;
