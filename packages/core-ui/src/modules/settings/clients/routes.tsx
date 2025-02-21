import { Route, Routes, useLocation } from 'react-router-dom';
import queryString from 'query-string';
import React from 'react';
import asyncComponent from 'modules/common/components/AsyncComponent';

const Clients = asyncComponent(
  () => import(/* webpackChunkName: "Clients - Settings" */ './containers/List')
);

const Element = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Clients queryParams={queryParams} />;
};

const routes = () => {
  
  return (
    <Routes>
      <Route path='/settings/clients/' element={<Element />} />
    </Routes>
  );
};
export default routes;
