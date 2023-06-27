import withCurrentUser from '@erxes/ui/src/auth/containers/withCurrentUser';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "List - Timeclocks" */ './containers/List')
);

const mainContent = ({ location, history, currentUser }) => {
  const queryParams = queryString.parse(location.search);
  const routePath = location.pathname.split('/').slice(-1)[0];

  return (
    <List
      searchFilter={location.search}
      history={history}
      queryParams={queryParams}
      route={routePath}
      currentUser={currentUser}
    />
  );
};

const routes = ({ currentUser }) => {
  return (
    <>
      <Route
        path="/timeclocks"
        component={props => mainContent({ ...props, currentUser })}
      />
    </>
  );
};

export default withCurrentUser(routes);
