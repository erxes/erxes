import CompanyRoutes from './companies/routes';
import CustomerRoutes from './customers/routes';
import React from 'react';

const routes = () => {
  return (
    <>
      <CustomerRoutes />
      <CompanyRoutes />
    </>
  );
};

export default routes;
