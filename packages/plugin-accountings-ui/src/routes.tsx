import React from 'react';
import AccountRoutes from './settings/accounts/routes';
import TransactionRoutes from './transactions/routes';


const routes = () => {
  return (
    <>
      <AccountRoutes />;
      <TransactionRoutes />
    </>
  );
};

export default routes;
