import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import KnowledgeRoutes from './routes';

const Routes = () => (
  <Router>
    <KnowledgeRoutes />
  </Router>
);

export default Routes;