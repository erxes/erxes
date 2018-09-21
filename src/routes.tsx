import { withCurrentUser } from 'modules/auth/containers';
import { MainBar } from 'modules/layout/components';
import { MainLayout } from 'modules/layout/containers';
import { MainWrapper } from 'modules/layout/styles';
import * as React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AuthRoutes from './modules/auth/routes';
import { IUser } from './modules/auth/types';
import CompaniesRoutes from './modules/companies/routes';
import CustomersRoutes from './modules/customers/routes';
import DealsRoutes from './modules/deals/routes';
import EngageRoutes from './modules/engage/routes';
import FormRoutes from './modules/forms/routes';
import InboxRoutes from './modules/inbox/routes';
import InsightsRoutes from './modules/insights/routes';
import KnowledgeBaseRoutes from './modules/knowledgeBase/routes';
import NotificationRoutes from './modules/notifications/routes';
import SegmentsRoutes from './modules/segments/routes';
import SettingsRoutes from './modules/settings/routes';
import TagsRoutes from './modules/tags/routes';

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
        <FormRoutes />
        <SettingsRoutes />
        <TagsRoutes />
        <NotificationRoutes />
        <DealsRoutes />
      </MainWrapper>
    );
  }

  return <AuthRoutes />;
};

const Routes = ({ currentUser }: { currentUser: IUser }) => (
  <Router>
    <MainLayout currentUser={currentUser}>
      {renderRoutes(currentUser)}
    </MainLayout>
  </Router>
);

export default withCurrentUser(Routes);
