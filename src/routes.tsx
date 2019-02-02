import { withCurrentUser } from 'modules/auth/containers';
import { MainBar } from 'modules/layout/components';
import { MainLayout } from 'modules/layout/containers';
import { MainWrapper } from 'modules/layout/styles';
import { userConfirmation } from 'modules/settings/team/routes';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
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
import OnboardRoutes from './modules/onboard/routes';
import SegmentsRoutes from './modules/segments/routes';
import SettingsRoutes from './modules/settings/routes';
import TagsRoutes from './modules/tags/routes';

const renderRoutes = currentUser => {
  if (currentUser) {
    return (
      <>
        <OnboardRoutes />
        <MainLayout currentUser={currentUser}>
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
        </MainLayout>
      </>
    );
  }

  return (
    <Switch>
      <Route
        key="/invitation"
        exact={true}
        path="/invitation"
        component={userConfirmation}
      />
      <AuthRoutes />
    </Switch>
  );
};

const Routes = ({ currentUser }: { currentUser: IUser }) => (
  <Router>{renderRoutes(currentUser)}</Router>
);

export default withCurrentUser(Routes);
