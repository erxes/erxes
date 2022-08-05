import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import LogsRoutes from './routes';

const Routes = () => (
  <Router>
    <LogsRoutes />
  </Router>
);

export default Routes;