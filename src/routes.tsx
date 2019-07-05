import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import asyncComponent from 'modules/common/components/AsyncComponent';
import { MainWrapper } from 'modules/layout/styles';
import { userConfirmation } from 'modules/settings/team/routes';
import React from 'react';
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
import TaskRoutes from './modules/tasks/routes';
import TicketRoutes from './modules/tickets/routes';

const MainLayout = asyncComponent(() =>
  import(/* webpackChunkName: "MainLayout" */ 'modules/layout/containers/MainLayout')
);

const MainBar = asyncComponent(() =>
  import(/* webpackChunkName: "MainBar" */ 'modules/layout/components/MainBar')
);

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
            <TicketRoutes />
            <TaskRoutes />
          </MainWrapper>
        </MainLayout>
      </>
    );
  }

  return (
    <Switch>
      <Route
        key="/confirmation"
        exact={true}
        path="/confirmation"
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
