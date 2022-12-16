import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import Wrapper from '@erxes/ui/src/layout/components/Wrapper';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';
import { menuTimeClock } from './menu';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Timeclocks" */ './containers/List')
);

const AbsenceList = asyncComponent(() =>
  import(/* webpackChunkName: "List - Absence" */ './containers/AbsenceList')
);

const ReportList = asyncComponent(() => import('./containers/ReportList'));

const ScheduleList = asyncComponent(() => import('./containers/ScheduleList'));

const ConfigList = asyncComponent(() => import('./containers/ConfigList'));

const timeclocks = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { startDate, endDate, userIds } = queryParams;

  return (
    <List
      queryStartDate={startDate}
      queryEndDate={endDate}
      queryUserIds={userIds ? userIds.split(',') : null}
      history={history}
      queryParams={queryParams}
    />
  );
};
const schedule = ({ location, history }) => {
  const route_path = location.pathname.split('/').slice(-1)[0];
  const queryParams = queryString.parse(location.search);
  const { startDate, endDate } = queryParams;

  return route_path === 'requests' ? (
    <AbsenceList
      queryStartDate={startDate}
      queryEndDate={endDate}
      queryParams={queryParams}
      history={history}
    />
  ) : (
    <ScheduleList queryParams={queryParams} history={history} />
  );
};

const report = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { startDate, endDate, userId, branchIds, departmentIds } = queryParams;

  return (
    <ReportList
      departmentIds={departmentIds ? departmentIds.split(',') : null}
      branchIds={branchIds ? branchIds.split(',') : null}
      queryStartDate={startDate}
      queryEndDate={endDate}
      queryUserId={userId}
      queryParams={queryParams}
      history={history}
    />
  );
};
const config = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  return <ConfigList queryParams={queryParams} history={history} />;
};

const routes = () => {
  return (
    <>
      <Route path="/timeclocks" exact={true} component={timeclocks} />
      <Route path="/timeclocks/requests" component={schedule} />
      <Route path="/timeclocks/schedule" component={schedule} />
      <Route path="/timeclocks/report" component={report} />
      <Route path="/timeclocks/config" component={config} />
    </>
  );
};

export default routes;
