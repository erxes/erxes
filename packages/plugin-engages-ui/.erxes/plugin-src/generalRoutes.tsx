import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import EngageRoutes from './routes';
import { AppProvider } from '@erxes/ui/src/appContext';

const Routes = () => (
  <Router>
    <AppProvider>
      <EngageRoutes />
    </AppProvider>
  </Router>
);

export default Routes;
