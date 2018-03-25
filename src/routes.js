import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthRoutes from './modules/auth/routes';
import SegmentsRoutes from './modules/segments/routes';
import CustomersRoutes from './modules/customers/routes';
import CompaniesRoutes from './modules/companies/routes';
import InsightsRoutes from './modules/insights/routes';
import EngageRoutes from './modules/engage/routes';
import KnowledgeBaseRoutes from './modules/knowledgeBase/routes';
import SettingsRoutes from './modules/settings/routes';
import InboxRoutes from './modules/inbox/routes';
import TagsRoutes from './modules/tags/routes';
import DealsRoutes from './modules/deals/routes';
import NotificationRoutes from './modules/notifications/routes';
import { MainLayout } from 'modules/layout/containers';
import { MainBar } from 'modules/layout/components';
import { MainWrapper } from 'modules/layout/styles';
import { withCurrentUser } from 'modules/auth/containers';

const renderRoutes = currentUser => {
  if (currentUser) {
    return (
      <MainWrapper>
        <MainBar />

        <InboxRoutes />
        <SegmentsRoutes />
        <CustomersRoutes />
        <CompaniesRoutes />
        <InsightsRoutes />
        <EngageRoutes />
        <KnowledgeBaseRoutes />
        <SettingsRoutes />
        <TagsRoutes />
        <NotificationRoutes />
        <DealsRoutes />
      </MainWrapper>
    );
  }

  return <AuthRoutes />;
};

const Routes = ({ currentUser }) => (
  <Router>
    <MainLayout>{renderRoutes(currentUser)}</MainLayout>
  </Router>
);

Routes.propTypes = {
  currentUser: PropTypes.object
};

export default withCurrentUser(Routes);
