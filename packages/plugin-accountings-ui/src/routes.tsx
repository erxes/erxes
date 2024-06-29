import React from 'react';
import AccountRoutes from './settings/accounts/routes';
import ConfigsRoutes from './settings/configs/routes';
import TransactionRoutes from './transactions/routes';


const routes = () => {
  return (
    <>
      <AccountRoutes />
      <ConfigsRoutes />
      <TransactionRoutes />
    </>
  );
};

export default routes;
