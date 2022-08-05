import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import WebhooksRoutes from './routes';

const Routes = () => (
  <Router>
    <WebhooksRoutes />
  </Router>
);

export default Routes;