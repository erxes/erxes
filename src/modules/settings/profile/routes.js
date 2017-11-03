import React from 'react';
import { Route } from 'react-router-dom';
import { MainLayout } from '../../layout/containers';
import { Profile } from './containers';

const routes = () => [
  <Route
    key="/settings/profile"
    exact
    path="/settings/profile"
    component={() => {
      return <MainLayout content={<Profile />} />;
    }}
  />
];

export default routes;
