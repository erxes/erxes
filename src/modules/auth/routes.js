import React from 'react';
import { Route } from 'react-router-dom';
import { AuthLayout } from '../layout/containers';
import { SignInContainer, ForgotPasswordContainer } from './containers';

const routes = () => [
  <Route
    path="/sign-in"
    key="signIn"
    component={() => {
      return <AuthLayout content={<SignInContainer />} />;
    }}
  />,

  <Route
    path="/forgot-password"
    key="forgotPassword"
    component={() => {
      return <AuthLayout content={<ForgotPasswordContainer />} />;
    }}
  />
];

export default routes;
