import { Route, useLocation, Routes } from 'react-router-dom';
import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const VatRowList = asyncComponent(() => import('./containers/VatRowList'));

const VatRows = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <VatRowList queryParams={queryParams} />;
};

const AccountRoutes = () => {
  return (
    <Routes>
      <Route key="/accountings/vat-rows" path="/accountings/vat-rows" element={<VatRows />} />
    </Routes>
  );
};

export default AccountRoutes;
