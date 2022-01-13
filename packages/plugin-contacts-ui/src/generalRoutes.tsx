import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import CompanyRoutes from './companies/routes';
import  CustomerRoutes from './customers/routes';

const Routes = () => (
  <Router>
    <CompanyRoutes/>
    <CustomerRoutes/>
  </Router>
);

export default Routes;