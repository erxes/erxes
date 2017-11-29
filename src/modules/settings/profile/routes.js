import React from 'react';
import { Route } from 'react-router-dom';
import { Profile, ChangePassword, NotificationSettings } from './containers';

const routes = () => [
  <Route
    key="/settings/profile"
    exact
    path="/settings/profile"
    component={() => {
      return <Profile />;
    }}
  />,

  <Route
    key="/change-password"
    exact
    path="/change-password"
    component={() => {
      return <ChangePassword />;
    }}
  />,

  <Route
    key="/settings/notification-settings"
    exact
    path="/settings/notification-settings"
    component={() => {
      return <NotificationSettings />;
    }}
  />
];

export default routes;
