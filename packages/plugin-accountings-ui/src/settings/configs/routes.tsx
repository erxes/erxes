import { Route, useLocation, Routes } from 'react-router-dom';
import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const Settings = asyncComponent(() => import('./containers/GeneralSettings'));

const Accounts = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Settings queryParams={queryParams} />;
};

const AccountRoutes = () => {
  return (
    <Routes>
      <Route key="/accountings/configs" path="/accountings/configs" element={<Accounts />} />
    </Routes>
  );
};

export default AccountRoutes;
