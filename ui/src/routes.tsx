import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import asyncComponent from 'modules/common/components/AsyncComponent';
import { userConfirmation } from 'modules/settings/team/routes';
import React from 'react';
import { Route, Router, Switch } from 'react-router-dom';
import history from './browserHistory';
import AuthRoutes from './modules/auth/routes';
import { IUser } from './modules/auth/types';
import CompaniesRoutes from './modules/companies/routes';
import CustomersRoutes from './modules/customers/routes';
import DealsRoutes from './modules/deals/routes';
import EngageRoutes from './modules/engage/routes';
import GrowthHackRoutes from './modules/growthHacks/routes';
import InboxRoutes from './modules/inbox/routes';
import InsightsRoutes from './modules/insights/routes';
import KnowledgeBaseRoutes from './modules/knowledgeBase/routes';
import LeadRoutes from './modules/leads/routes';
import NotificationRoutes from './modules/notifications/routes';
import SegmentsRoutes from './modules/segments/routes';
import SettingsRoutes from './modules/settings/routes';
import TagsRoutes from './modules/tags/routes';
import TaskRoutes from './modules/tasks/routes';
import TicketRoutes from './modules/tickets/routes';
import VideoCallRoutes from './modules/videoCall/routes';

const MainLayout = asyncComponent(() =>
  import(/* webpackChunkName: "MainLayout" */ 'modules/layout/containers/MainLayout')
);

const renderRoutes = currentUser => {
  if (currentUser) {
    return (
      <>
        <MainLayout currentUser={currentUser}>
          <NotificationRoutes />
          <InboxRoutes />
          <SegmentsRoutes />
          <CustomersRoutes />
          <CompaniesRoutes />
          <InsightsRoutes />
          <EngageRoutes />
          <KnowledgeBaseRoutes />
          <LeadRoutes />
          <SettingsRoutes />
          <TagsRoutes />
          <DealsRoutes />
          <TicketRoutes />
          <TaskRoutes />
          <GrowthHackRoutes />
          <VideoCallRoutes />
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
  <Router history={history}>{renderRoutes(currentUser)}</Router>
);

export default withCurrentUser(Routes);
