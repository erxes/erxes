import { AppProvider } from '@erxes/ui/src/appContext';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import InboxRoutes from './routes';

const Routes = () => (
  <Router>
    <AppProvider currentUser={{_id: 'sss', username: 'any', email: 'anu.b@nma.c'}} >
    <InboxRoutes />
    </AppProvider>
  </Router>
);

export default Routes;
