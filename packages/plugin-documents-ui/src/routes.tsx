import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const List = asyncComponent(() =>
  import(/* webpackChunkName: "Settings - List Document" */ './containers/List')
);

const Documents = () => {
  const location = useLocation();
  
  return (
    <List queryParams={queryString.parse(location.search)} />
  );
};

const routes = () => (
  <Routes>
    <Route path="/settings/documents/" element={<Documents/>} />
  </Routes>
);

export default routes;
