import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';

const PackageList = asyncComponent(() =>
  import(/* webpackChunkName: "PackageList" */ './containers/PackageList')
);

const List = () => {
  const location = useLocation()
  
  return (
    <PackageList
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => {
  return (
    <Routes>
      <Route
        key="/block/list"
        path="/block/list"
        element={<List/>}
      />
    </Routes>
  );
};

export default routes;
