import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';

const List = asyncComponent(
  () => import(/* webpackChunkName: "List - Tags" */ './containers/List'),
);

const Tags = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return <List history={navigate} queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/settings/tags/" element={<Tags />} />
    </Routes>
  );
};

export default routes;
