import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { pluginLayouts, pluginRouters } from './pluginUtils';

import OSAuthRoutes from './modules/auth/routes';
import SAASAuthRoutes from './modules/saas/auth/routes';
import { IUser } from './modules/auth/types';
import React from 'react';
import SettingsRoutes from './modules/settings/routes';
import WelcomeRoutes from './modules/welcome/routes';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';
import OnboardingRoutes from './modules/saas/onBoarding/routes';
import AccountSuspended from 'modules/saas/limit/AccountSuspend';
import { getEnv } from 'modules/common/utils';
import { getVersion } from '@erxes/ui/src/utils/core';

const MainLayout = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "MainLayout" */ 'modules/layout/containers/MainLayout'
    ),
);

const OnboardingLayout = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "OnboardingLayout" */ 'modules/saas/onBoarding/container/OnboardingLayout'
    ),
);

const Unsubscribe = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Unsubscribe" */ 'modules/auth/containers/Unsubscribe'
    ),
);

const UserConfirmation = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - UserConfirmation" */ '@erxes/ui/src/team/containers/UserConfirmation'
    ),
);

export const unsubscribe = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <Unsubscribe queryParams={queryParams} />;
};

const renderRoutes = (currentUser) => {
  const userConfirmation = ({ location }) => {
    const queryParams = queryString.parse(location.search);

    return (
      <UserConfirmation queryParams={queryParams} currentUser={currentUser} />
    );
  };

  if (!sessionStorage.getItem('sessioncode')) {
    sessionStorage.setItem('sessioncode', Math.random().toString());
  }

  const { VERSION } = getVersion();

  if (currentUser) {
    if (VERSION && VERSION === 'saas') {
      const currentOrganization = currentUser.currentOrganization;

      if (currentOrganization) {
        if (!currentOrganization.onboardingDone) {
          return (
            <OnboardingLayout>
              <OnboardingRoutes currentUser={currentUser} />
            </OnboardingLayout>
          );
        }

        if (!currentOrganization.contactRemaining) {
          return (
            <>
              <MainLayout currentUser={currentUser}>
                <AccountSuspended />;
              </MainLayout>
            </>
          );
        }
      }
    }

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
      {VERSION && VERSION === 'saas' ? <SAASAuthRoutes /> : <OSAuthRoutes />}
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

      {renderRoutes(currentUser)}
    </>
  </Router>
);

export default withCurrentUser(Routes);
