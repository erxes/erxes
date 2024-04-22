import { Route, Routes, useLocation } from 'react-router-dom';

import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const List = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - List Scripts" */ './containers/List'
    ),
);

const Scripts = () => {
  const location = useLocation();

  return <List queryParams={queryString.parse(location.search)} />;
};

const routes = () => (
  <Routes>
    <Route path="/settings/scripts/" element={<Scripts />} />
  </Routes>
);

export default routes;
