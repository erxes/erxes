import { Route, useLocation, Routes, useNavigate } from 'react-router-dom';
import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const AccountList = asyncComponent(() => import('./containers/AccountList'));

const Accounts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return <AccountList navigate={navigate} queryParams={queryParams} />;
};

const AccountRoutes = () => {
  return (
    <Routes>
      <Route key="/accountings/accounts" path="/accountings/accounts" element={<Accounts />} />
    </Routes>
  );
};

export default AccountRoutes;
