import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import ReportsRoutes from './routes';
import { AppProvider } from '@erxes/ui/src/appContext';

const Routes = () => (
  <Router>
    <AppProvider>
      <ReportsRoutes />
    </AppProvider>
  </Router>
);

export default Routes;
