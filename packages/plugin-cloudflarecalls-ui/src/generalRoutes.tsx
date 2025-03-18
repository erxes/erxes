import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import TRoutes from './routes';

const Routes = () => {
  return (
    <Router>
      <TRoutes />
    </Router>
  );
};

export default Routes;
