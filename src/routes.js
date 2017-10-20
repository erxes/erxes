import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom'
import SettingsRoutes from './modules/settings/routes';

const Routes = () => (
  <Router>
    <SettingsRoutes />
  </Router>
);

export default Routes;
