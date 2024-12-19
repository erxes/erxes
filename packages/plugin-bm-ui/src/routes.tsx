import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route, useLocation, Routes } from 'react-router-dom';

const List = asyncComponent(
  () => import(/* webpackChunkName: "List - Bms" */ './containers/List')
);

const Bms = ({}) => {
  const location = useLocation();
  const queryParams = queryString.parse(location?.search);
  const { type } = queryParams;

  return <List typeId={type} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path='/bms/' element={<Bms />} />
    </Routes>
  );
};

export default routes;
