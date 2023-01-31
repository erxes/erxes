import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Timeclocks" */ './containers/List')
);

const mainContent = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);
  const routePath = location.pathname.split('/').slice(-1)[0];

  return (
    <List
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
