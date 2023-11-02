import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Reportss" */ './containers/List')
);

const reports = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <List typeId={type} history={history} />;
};

const ReportForm = asyncComponent(() =>
  import('./components/report/ReportForm')
);

const dashboardDetail = ({ match, location, history }) => {
  return (
    <ReportForm
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route path="/reports/" component={reports} />;
      <Route
        key="/reports/details"
        exact={true}
        path="/reports/details/create-report"
        component={dashboardDetail}
      />
    </>
  );
};

export default routes;
