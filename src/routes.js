import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import FieldsRoutes from './modules/fields/routes';
import SegmentsRoutes from './modules/segments/routes';
import CustomersRoutes from './modules/customers/routes';
import CompaniesRoutes from './modules/companies/routes';
import InsightsRoutes from './modules/insights/routes';
import SettingsRoutes from './modules/settings/routes';

const Routes = () => (
  <Router>
    <div>
      <FieldsRoutes />
      <SegmentsRoutes />
      <CustomersRoutes />
      <CompaniesRoutes />
      <InsightsRoutes />
      <SettingsRoutes />
    </div>
  </Router>
);

export default Routes;
