import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../../layout/containers';
import { Profile, ChangePassword, NotificationSettings } from './containers';

const routes = () => [
  <Route
    key="/settings/profile"
    exact
    path="/settings/profile"
    component={() => {
      return <MainLayout content={<Profile />} />;
    }}
  />,

  <Route
    key="/change-password"
    exact
    path="/change-password"
    component={() => {
      return <MainLayout content={<ChangePassword />} />;
    }}
  />,

  <Route
    key="/settings/notification-settings"
    exact
    path="/settings/notification-settings"
    component={() => {
      return <MainLayout content={<NotificationSettings />} />;
    }}
  />
];

export default routes;
