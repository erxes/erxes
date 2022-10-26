import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Timeclocks" */ './containers/List')
);

const AbsenceList = asyncComponent(() => import('./containers/AbsenceList'));
const timeclocks = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const { startDate, endDate, userId } = queryParams;
  // const date = new Date().toDateString();
  // console.log(date);
  // console.log(date);

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
const absence = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <AbsenceList />;
};

const routes = () => {
  return (
    <>
      <Route path="/timeclocks/" component={timeclocks} />;
      <Route path="/timeclocks/absence" component={absence} />;
    </>
  );
};

export default routes;
