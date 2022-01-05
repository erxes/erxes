import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import BookingsRoutes from './routes';

const Routes = () => (
  <Router>
    <BookingsRoutes />
  </Router>
);

export default Routes;
