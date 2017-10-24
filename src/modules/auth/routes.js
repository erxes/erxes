import React from 'react';
import { Route } from 'react-router-dom';
import { AuthLayout } from '../layout/containers';
import { SignInContainer } from './containers';

const routes = () => (
  <Route
    path="/sign-in"
    component={() => {
      return <AuthLayout content={<SignInContainer />} />;
    }}
  />
);

export default routes;
