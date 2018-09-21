import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { AuthLayout } from '../layout/components';
import { ForgotPassword, ResetPassword, SignIn } from './containers';

const routes = () => (
  <React.Fragment>
    <Route
      path="/sign-in"
      key="signIn"
      component={() => {
        return <AuthLayout content={<SignIn />} />;
      }}
    />

    <Route
      path="/forgot-password"
      key="forgotPassword"
      component={() => {
        return <AuthLayout content={<ForgotPassword />} />;
      }}
    />

    <Route
      path="/reset-password"
      key="resetPassword"
      component={({ location }) => {
        const parsed = queryString.parse(location.search);
        return <AuthLayout content={<ResetPassword token={parsed.token || ''} />} />;
      }}
    />
  </React.Fragment>
);

export default routes;
