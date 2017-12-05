import React from 'react';
import { Route } from 'react-router-dom';
import { Profile, ChangePassword, NotificationSettings } from './containers';

const routes = () => [
  <Route
    key="/settings/profile"
    exact
    path="/settings/profile"
    component={Profile}
  />,

  <Route
    key="/settings/change-password"
    exact
    path="/settings/change-password"
    component={ChangePassword}
  />,

  <Route
    key="/settings/notification-settings"
    exact
    path="/settings/notification-settings"
    component={NotificationSettings}
  />
];

export default routes;
