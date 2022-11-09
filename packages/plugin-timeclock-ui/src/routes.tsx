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

const ScheduleList = asyncComponent(() => import('./containers/ScheduleList'));

const timeclocks = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { startDate, endDate, userId } = queryParams;

  return (
    <List
      queryStartDate={startDate}
      queryEndDate={endDate}
      queryUserId={userId}
      history={history}
      queryParams={queryParams}
    />
  );
};
const schedule = ({ location, history }) => {
  const route_path = location.pathname.split('/').slice(-1)[0];
  const queryParams = queryString.parse(location.search);
  const { startDate, endDate, userId } = queryParams;

  return route_path === 'absence' ? (
    <AbsenceList
      queryStartDate={startDate}
      queryEndDate={endDate}
      queryUserId={userId}
      queryParams={queryParams}
      history={history}
    />
  ) : (
    <ScheduleList
      queryParams={queryParams}
      queryUserId={userId}
      history={history}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route path="/timeclocks" exact={true} component={timeclocks} />
      <Route path="/timeclocks/absence" component={schedule} />
      <Route path="/timeclocks/schedule" component={schedule} />
    </>
  );
};

export default routes;
