import {
  Routes as BrowserRoutes,
  Route,
  BrowserRouter as Router,
  useLocation,
} from 'react-router-dom';
import { pluginLayouts, pluginRouters } from './pluginUtils';

import AuthRoutes from './modules/auth/routes';
import { IUser } from './modules/auth/types';
import React from 'react';
import SettingsRoutes from './modules/settings/routes';
import WelcomeRoutes from './modules/welcome/routes';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import withCurrentUser from 'modules/auth/containers/withCurrentUser';

const MainLayout = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "MainLayout" */ 'modules/layout/containers/MainLayout'
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

  if (currentUser) {
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
      <AuthRoutes />
    </>
  );
};

const Routes = ({ currentUser }: { currentUser: IUser }) => (
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

export default withCurrentUser(Routes);
