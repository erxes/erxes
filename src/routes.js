import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import InsightsRoutes from './modules/insights/routes';
import SettingsRoutes from './modules/settings/routes';

const Routes = () => (
  <Router>
    <div>
      <InsightsRoutes />
      <SettingsRoutes />
    </div>
  </Router>
);

export default Routes;
