import queryString from 'query-string';
import * as React from 'react';
import { Route } from 'react-router-dom';
import { AuthLayout } from '../layout/components';
import { ForgotPassword, ResetPassword, SignIn } from './containers';

const routes = () => {
  const home = () => <AuthLayout content={<SignIn />} />;
  const signIn = () => <AuthLayout content={<SignIn />} />;
  const forgotPassword = () => <AuthLayout content={<ForgotPassword />} />;

  const resetPassword = ({ location }) => {
    const parsed = queryString.parse(location.search);
    return (
      <AuthLayout content={<ResetPassword token={parsed.token || ''} />} />
    );
  };

  return (
    <React.Fragment>
      <Route path="/" component={home} />

      <Route path="/sign-in" component={signIn} />

      <Route path="/forgot-password" component={forgotPassword} />

      <Route path="/reset-password" component={resetPassword} />
    </React.Fragment>
  );
};

export default routes;
