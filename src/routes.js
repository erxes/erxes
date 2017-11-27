import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthRoutes from './modules/auth/routes';
import FieldsRoutes from './modules/fields/routes';
import SegmentsRoutes from './modules/segments/routes';
import CustomersRoutes from './modules/customers/routes';
import CompaniesRoutes from './modules/companies/routes';
import InsightsRoutes from './modules/insights/routes';
import EngageRoutes from './modules/engage/routes';
import SettingsRoutes from './modules/settings/routes';
import InboxRoutes from './modules/inbox/routes';
import TagsRoutes from './modules/tags/routes';
import NotificationRoutes from './modules/notifications/routes';
import { MainLayout } from 'modules/layout/containers';

const Routes = () => (
  <Router>
    <MainLayout>
      <AuthRoutes />
      <InboxRoutes />
      <FieldsRoutes />
      <SegmentsRoutes />
      <CustomersRoutes />
      <CompaniesRoutes />
      <InsightsRoutes />
      <EngageRoutes />
      <SettingsRoutes />
      <TagsRoutes />
      <NotificationRoutes />
    </MainLayout>
  </Router>
);

export default Routes;
