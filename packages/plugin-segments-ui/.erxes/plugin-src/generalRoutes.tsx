import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import SegmentRoutes from './routes';
import { AppProvider } from '@erxes/ui/src/appContext';

const Routes = () => (
  <Router>
    <AppProvider>
      <SegmentRoutes />
    </AppProvider>
  </Router>
);

export default Routes;
