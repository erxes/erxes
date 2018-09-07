import * as React from 'react';
import queryString from 'query-string';
import { Route } from 'react-router-dom';
import { AuthLayout } from '../layout/containers';
import { SignIn, ForgotPassword, ResetPassword } from './containers';

const routes = () => [
  <Route
    path="/sign-in"
    key="signIn"
    component={() => {
      return <AuthLayout content={<SignIn />} />;
    }}
  />,

  <Route
    path="/forgot-password"
    key="forgotPassword"
    component={() => {
      return <AuthLayout content={<ForgotPassword />} />;
    }}
  />,

  <Route
    path="/reset-password"
    key="resetPassword"
    component={({ location }) => {
      const parsed = queryString.parse(location.search);
      return <AuthLayout content={<ResetPassword token={parsed.token} />} />;
    }}
  />
];

export default routes;
