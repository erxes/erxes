import React from 'react';
import CompanyRoutes from './companies/routes';
import CustomerRoutes from './customers/routes';

const routes = () => {
  return (
    <React.Fragment>
      <CustomerRoutes />
      <CompanyRoutes />
    </React.Fragment>
  );
};

export default routes;
