import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import asyncComponent from 'modules/common/components/AsyncComponent';
import { pluginsOfRoutes } from 'pluginUtils';
import queryString from 'query-string';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AuthRoutes from './modules/auth/routes';
import { IUser } from './modules/auth/types';
import CalendarRoutes from './modules/calendar/routes';
import CompaniesRoutes from './modules/companies/routes';
import CustomersRoutes from './modules/customers/routes';
import DashboardRoutes from './modules/dashboard/routes';
import DealsRoutes from './modules/deals/routes';
import EngageRoutes from 'engages/routes';
import GrowthHackRoutes from './modules/growthHacks/routes';
import InboxRoutes from './modules/inbox/routes';
import KnowledgeBaseRoutes from './modules/knowledgeBase/routes';
import LeadRoutes from './modules/leads/routes';
import NotificationRoutes from './modules/notifications/routes';
import SegmentsRoutes from './modules/segments/routes';
import SettingsRoutes from './modules/settings/routes';
import TagsRoutes from './modules/tags/routes';
import TaskRoutes from './modules/tasks/routes';
import TicketRoutes from './modules/tickets/routes';
import TutorialRoutes from './modules/tutorial/routes';
import VideoCallRoutes from './modules/videoCall/routes';
import AutomationsRoutes from './modules/automations/routes';
import ImportExportRoutes from './modules/importExport/routes';
import BookingsRoutes from './modules/bookings/routes';

const MainLayout = asyncComponent(() =>
  import(
    /* webpackChunkName: "MainLayout" */ 'modules/layout/containers/MainLayout'
  )
);

const Unsubscribe = asyncComponent(() =>
  import(
    /* webpackChunkName: "Unsubscribe" */ 'modules/auth/containers/Unsubscribe'
  )
);

const UserConfirmation = asyncComponent(() =>
  import(
    /* webpackChunkName: "Settings - UserConfirmation" */ 'modules/settings/team/containers/UserConfirmation'
  )
);

const Schedule = asyncComponent(() =>
  import(
    /* webpackChunkName: "Calendar - Schedule" */ 'modules/calendar/components/scheduler/Index'
  )
);

export const unsubscribe = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <Unsubscribe queryParams={queryParams} />;
};

const schedule = ({ match }) => {
  const slug = match.params.slug;

  return <Schedule slug={slug} />;
};

const renderRoutes = currentUser => {
  const userConfirmation = ({ location }) => {
    const queryParams = queryString.parse(location.search);

    return (
      <UserConfirmation queryParams={queryParams} currentUser={currentUser} />
    );
  };

  if (!sessionStorage.getItem('sessioncode')) {
    sessionStorage.setItem('sessioncode', Math.random().toString());
  }

  const { pathname } = window.location;

  if (pathname.search('/schedule/') === 0) {
    return null;
  }

  if (currentUser) {
    const { plugins, pluginRoutes, specialPluginRoutes } = pluginsOfRoutes(
      currentUser
    );

    return (
      <>
        <MainLayout currentUser={currentUser} plugins={plugins}>
          <NotificationRoutes />
          <InboxRoutes />
          <SegmentsRoutes />
          <CustomersRoutes />
          <CompaniesRoutes />
          <KnowledgeBaseRoutes />
          <LeadRoutes />
          <SettingsRoutes />
          <TagsRoutes />
          <DealsRoutes />
          <EngageRoutes />
          <TicketRoutes />
          <TaskRoutes />
          <GrowthHackRoutes />
          <VideoCallRoutes />
          <TutorialRoutes />
          <CalendarRoutes />
          <DashboardRoutes />
          <AutomationsRoutes />
          <ImportExportRoutes />
          <BookingsRoutes />

          {specialPluginRoutes}
          {pluginRoutes}

          <Route
            key="/confirmation"
            exact={true}
            path="/confirmation"
            component={userConfirmation}
          />
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
  <Router>
    <>
      <Route
        key="/unsubscribe"
        exact={true}
        path="/unsubscribe"
        component={unsubscribe}
      />

      <Route
        key="/schedule"
        exact={true}
        path="/schedule/:slug"
        component={schedule}
      />

      {renderRoutes(currentUser)}
    </>
  </Router>
);

export default withCurrentUser(Routes);
