import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route } from 'react-router-dom';

const PermissionList = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - PermissionList" */ './containers/PermissionList'
  )
);

const permissionList = ({ location, history }) => {
  const queryParams = queryString.parse(location.search);

  return <PermissionList queryParams={queryParams} history={history} />;
};

const routes = () => (
  <Route
    exact={true}
    path="/settings/permissions/"
    component={permissionList}
  />
);

export default routes;
