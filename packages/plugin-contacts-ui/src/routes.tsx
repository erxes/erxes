import CompanyRoutes from './companies/routes';
import CustomerRoutes from './customers/routes';
import React from 'react';
import { Routes } from 'react-router-dom';

const routes = () => {
  return (
    <Routes>
      <CustomerRoutes />
      <CompanyRoutes />
    </Routes>
  );
};

export default routes;
