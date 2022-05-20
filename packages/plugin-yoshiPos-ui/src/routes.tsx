import withCurrentUser from './auth/containers/withCurrentUser';
import asyncComponent from './common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AuthRoutes from './auth/routes';
import SettingsRoutes from './settings/routes';
import KitchenRoutes from './kitchen/routes';
import WaitingRoutes from './/waiting/routes';
import OrderRoutes from './orders/routes';
import QPayRoutes from './qpay/routes';
import { IUser } from './auth/types';
import { IConfig } from './types';

const MainLayout = asyncComponent(() =>
  import(/* webpackChunkName: "MainLayout" */ './layout/containers/MainLayout')
);

const Unsubscribe = asyncComponent(() =>
  import(/* webpackChunkName: "Unsubscribe" */ './auth/containers/Unsubscribe')
);

export const unsubscribe = ({ location }) => {
  const queryParams = queryString.parse(location.search);

  return <Unsubscribe queryParams={queryParams} />;
};

const renderRoutes = (posCurrentUser, currentConfig, orientation) => {
  const userConfirmation = ({ location }) => {
    const queryParams = queryString.parse(location.search);

    const UserConfirmation = ({ queryParams, posCurrentUser }) => (
      <div>user confirmation</div>
    );

    return (
      <UserConfirmation
        queryParams={queryParams}
        posCurrentUser={posCurrentUser}
      />
    );
  };

  if (!sessionStorage.getItem('sessioncode')) {
    sessionStorage.setItem('sessioncode', Math.random().toString());
  }

  if (posCurrentUser) {
    return (
      <>
        <MainLayout
          posCurrentUser={posCurrentUser}
          orientation={orientation}
          currentConfig={currentConfig}
        >
          <OrderRoutes />
          <SettingsRoutes />
          <KitchenRoutes />
          <WaitingRoutes />
          <QPayRoutes />
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

const Routes = ({
  posCurrentUser,
  currentConfig,
  orientation
}: {
  posCurrentUser: IUser;
  currentConfig: IConfig;
  orientation: string;
}) => (
  <Router>
    <>
      <Route
        key="/unsubscribe"
        exact={true}
        path="/unsubscribe"
        component={unsubscribe}
      />

      {renderRoutes(posCurrentUser, currentConfig, orientation)}
    </>
  </Router>
);

export default withCurrentUser(Routes);
