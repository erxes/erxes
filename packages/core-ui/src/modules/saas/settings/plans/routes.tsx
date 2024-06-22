import * as React from 'react';

import { Route, Routes, useLocation } from 'react-router-dom';

import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const PlansContainer = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - PermissionList" */ './containers/Plans'
    ),
);

const Plans = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PlansContainer queryParams={queryParams} />;
};

const routes = () => (
  <Routes>
    <Route
      key="/settings/organizations/"
      path="/settings/organizations/"
      element={<Plans />}
    />
  </Routes>
);

export default routes;
