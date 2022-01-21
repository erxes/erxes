import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import TeamMemberRoutes from './routes';
import { AppProvider } from '@erxes/ui/src/appContext';

const Routes = () => (
  <Router>
    <AppProvider>
      <TeamMemberRoutes />
    </AppProvider>
  </Router>
);

export default Routes;
