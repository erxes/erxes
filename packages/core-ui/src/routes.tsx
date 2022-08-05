import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { pluginLayouts, pluginRouters } from './pluginUtils';

import AuthRoutes from './modules/auth/routes';
import { IUser } from './modules/auth/types';
import React from 'react';
import SettingsRoutes from './modules/settings/routes';
import WelcomeRoutes from './modules/welcome/routes';
import asyncComponent from 'modules/common/components/AsyncComponent';
import { isEnabled } from '@erxes/ui/src/utils/core';
import path from 'path';
import queryString from 'query-string';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';

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
    /* webpackChunkName: "Settings - UserConfirmation" */ '@erxes/ui/src/team/containers/UserConfirmation'
  )
);

const Schedule = asyncComponent(
  () =>
    isEnabled('calendar') &&
    path.resolve(
      /* webpackChunkName: "Calendar - Schedule" */ '@erxes/ui-calendar/src/components/scheduler/Index'
    )
);

export const unsubscribe = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <Unsubscribe queryParams={queryParams} />;
};

const schedule = ({ match }) => {
  const slug = match.params.slug;

  if (!isEnabled('calendar')) {
    return null;
  }

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
    return (
      <>
        <MainLayout currentUser={currentUser}>
          <SettingsRoutes />
          <WelcomeRoutes />
          {pluginLayouts(currentUser)}
          {pluginRouters()}

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
