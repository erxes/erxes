import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';

const PermissionList = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - PermissionList" */ './containers/PermissionList')
);

const GroupList = asyncComponent(() =>
  import(/* webpackChunkName: "Settings-UsersList" */ './containers/GroupList')
);

const permissionList = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <PermissionList queryParams={queryParams} history={history} />;
};

const groupList = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <GroupList queryParams={queryParams} history={history} />;
};

const routes = () => (
  <React.Fragment>
    <Route
      exact={true}
      path="/settings/permissions/"
      component={permissionList}
    />

    <Route exact={true} path="/settings/users/groups" component={groupList} />
  </React.Fragment>
);

export default routes;
