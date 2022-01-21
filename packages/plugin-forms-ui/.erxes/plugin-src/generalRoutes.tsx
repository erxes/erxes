import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import FormsRoutes from './routes';
import { AppProvider } from '@erxes/ui/src/appContext';

const Routes = () => (
  <Router>
    <AppProvider>
      <FormsRoutes />
    </AppProvider>
  </Router>
);

export default Routes;
