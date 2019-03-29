import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router';

const GroupList = asyncComponent(() =>
  import(/* webpackChunkName: "Settings-UsersList" */ './containers/List')
);

const groupList = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <GroupList queryParams={queryParams} history={history} />;
};

const routes = () => (
  <Route path="/settings/users/groups" component={groupList} />
);

export default routes;
