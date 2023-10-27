import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import PackageRoutes from './routes';

const Routes = () => (
  <Router>
    <PackageRoutes />
  </Router>
);

export default Routes;
