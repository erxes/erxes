import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import Report from './containers/report/Report';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Reportss" */ './containers/List')
);

const reports = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <List typeId={type} history={history} queryParams={queryParams} />;
};

const ReportForm = asyncComponent(() =>
  import('./containers/report/ReportForm')
);

const reportForm = ({ location, history }) => {
  return (
    <ReportForm
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const reportDetail = ({ match, location, history }) => {
  const reportId = match.params.id;
  const queryParams = queryString.parse(location.search);

  const props = { reportId, queryParams, history };
  return <Report {...props} />;
};

const routes = () => {
  return (
    <>
      <Route path="/reports" exact={true} component={reports} />
      <Route
        key="/reports/details/create-report"
        exact={true}
        path="/reports/details/create-report"
        component={reportForm}
      />
      <Route
        key="/reports/details/:id"
        exact={true}
        path="/reports/details/:id"
        component={reportDetail}
      />
    </>
  );
};

export default routes;
