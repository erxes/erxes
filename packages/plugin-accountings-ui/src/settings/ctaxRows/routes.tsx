import { Route, useLocation, Routes } from 'react-router-dom';
import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const CtaxRowList = asyncComponent(() => import('./containers/CtaxRowList'));

const CtaxRows = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <CtaxRowList queryParams={queryParams} />;
};

const AccountRoutes = () => {
  return (
    <Routes>
      <Route key="/accountings/ctax-rows" path="/accountings/ctax-rows" element={<CtaxRows />} />
    </Routes>
  );
};

export default AccountRoutes;
