import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Timeclocks" */ './containers/List')
);

const mainContent = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const {
    startDate,
    endDate,
    userIds,
    departmentIds,
    branchIds,
    page,
    perPage
  } = queryParams;
  const routePath = location.pathname.split('/').slice(-1)[0];

  return (
    <List
      queryStartDate={startDate || null}
      queryEndDate={endDate || null}
      queryUserIds={userIds || null}
      queryDepartmentIds={departmentIds || null}
      queryBranchIds={branchIds || null}
      queryPage={parseInt(page, 10)}
      queryPerPage={parseInt(perPage, 10)}
      searchFilter={location.search}
      history={history}
      queryParams={queryParams}
      route={routePath}
    />
  );
};
const routes = () => {
  return (
    <>
      <Route path="/timeclocks" component={mainContent} />
    </>
  );
};

export default routes;
