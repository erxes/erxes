import { Route, useLocation, Routes } from 'react-router-dom';
import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const AccountList = asyncComponent(() => import('./containers/AccountList'));

const Accounts = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <AccountList queryParams={queryParams} />;
};

const AccountRoutes = () => {
  return (
    <Routes>
      <Route key="/accountings/accounts" path="/accountings/accounts" element={<Accounts />} />
    </Routes>
  );
};

export default AccountRoutes;
