import React from 'react';
import AccountRoutes from './settings/accounts/routes';
import ConfigsRoutes from './settings/configs/routes';
import VatRowsRoutes from './settings/vatRows/routes';
import CtaxRowsRoutes from './settings/ctaxRows/routes';
import TransactionRoutes from './transactions/routes';


const routes = () => {
  return (
    <>
      <AccountRoutes />
      <ConfigsRoutes />
      <VatRowsRoutes />
      <CtaxRowsRoutes />
      <TransactionRoutes />
    </>
  );
};

export default routes;
