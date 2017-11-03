import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../../layout/containers';
import { Profile, ChangePassword } from './containers';

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
    key="/settings/change-password"
    exact
    path="/settings/change-password"
    component={() => {
      return <MainLayout content={<ChangePassword />} />;
    }}
  />
];

export default routes;
