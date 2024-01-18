import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import React from 'react';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';

const PermissionList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - PermissionList" */ './containers/PermissionList'
    ),
);

const PermissionListComponent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return <PermissionList queryParams={queryParams} history={navigate} />;
};

const routes = () => (
  <Routes>
    <Route
      path="/settings/permissions/"
      element={<PermissionListComponent />}
    />
  </Routes>
);

export default routes;
