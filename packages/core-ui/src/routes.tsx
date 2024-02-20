import {
  Routes as BrowserRoutes,
  Route,
  BrowserRouter as Router,
  useLocation,
} from 'react-router-dom';
import { pluginLayouts, pluginRouters } from './pluginUtils';

import AccountSuspended from 'modules/saas/limit/AccountSuspend';
import { IUser } from './modules/auth/types';
import OSAuthRoutes from './modules/auth/routes';
import OnboardingRoutes from './modules/saas/onBoarding/routes';
import React from 'react';
import SAASAuthRoutes from './modules/saas/auth/routes';
import SettingsRoutes from './modules/settings/routes';
import WelcomeRoutes from './modules/welcome/routes';
import asyncComponent from 'modules/common/components/AsyncComponent';
import { getVersion } from '@erxes/ui/src/utils/core';
import queryString from 'query-string';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';

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

export const UnsubscribeComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <Unsubscribe queryParams={queryParams} />;
};

const renderRoutes = (currentUser) => {
  const UserConfirmationComponent = () => {
    const location = useLocation();
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
          <WelcomeRoutes currentUser={currentUser} />
          {pluginLayouts(currentUser)}
          {pluginRouters()}
          <BrowserRoutes>
            <Route
              key="/confirmation"
              path="/confirmation"
              element={<UserConfirmationComponent />}
            />
          </BrowserRoutes>
        </MainLayout>
      </>
    );
  }

  return (
    <>
      <BrowserRoutes>
        <Route
          key="/confirmation"
          path="/confirmation"
          element={<UserConfirmationComponent />}
        />
      </BrowserRoutes>
      {VERSION && VERSION === 'saas' ? <SAASAuthRoutes /> : <OSAuthRoutes />}
    </>
  );
};

const Routes = ({ currentUser }: { currentUser: IUser }) => {
  return (
    <Router>
      <BrowserRoutes>
        <Route
          key="/unsubscribe"
          path="/unsubscribe"
          element={<UnsubscribeComponent />}
        />
      </BrowserRoutes>
      {renderRoutes(currentUser)}
    </Router>
  );
};

export default withCurrentUser(Routes);
