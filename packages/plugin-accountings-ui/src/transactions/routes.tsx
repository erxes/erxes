import { Route, Routes, useLocation, useParams } from "react-router-dom";
import React from 'react';
import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';

const PtrList = asyncComponent(() => import('./containers/PtrList'));
const Adjustings = asyncComponent(() => import('../adjustings/components/Adjustings'));
const TransactionForm = asyncComponent(() => import('./containers/TransactionForm'));

const PtrListContainer = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <PtrList queryParams={queryParams} />;
};

const AdjustingContainer = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Adjustings queryParams={queryParams} />;
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

      <Route key="/accountings/adjusting" path="/accountings/adjusting" element={<AdjustingContainer />} />
    </Routes>
  );
};

export default AccountRoutes;
