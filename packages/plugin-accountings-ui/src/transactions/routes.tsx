import { Route, Routes, useLocation, useParams } from "react-router-dom";
import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const PtrList = asyncComponent(() => import('./containers/PtrList'));
const TransactionForm = asyncComponent(() => import('./containers/TransactionForm'));

const PtrListContainer = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PtrList queryParams={queryParams} />;
};

const TransactionFormContainer = () => {
  const { parentId } = useParams();
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <TransactionForm queryParams={queryParams} parentId={parentId} />;
};

const AccountRoutes = () => {
  return (
    <Routes>
      <Route key="/accountings/ptrs" path="/accountings/ptrs" element={<PtrListContainer />} />

      <Route
        key="/accountings/transaction/edit/:parentId"
        path="/accountings/transaction/edit/:parentId"
        element={<TransactionFormContainer />}
      />
      <Route key="/accountings/transaction/create" path="/accountings/transaction/create" element={<TransactionFormContainer />} />
    </Routes>
  );
};

export default AccountRoutes;
