import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import LoanRoutes from './routes';

const Routes = () => (
  <Router>
    <LoanRoutes />
  </Router>
);

export default Routes;
