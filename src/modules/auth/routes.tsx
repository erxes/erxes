import queryString from 'query-string';
import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { AuthLayout } from '../layout/components';
import { ForgotPassword, ResetPassword, SignIn } from './containers';

const signIn = () => <AuthLayout content={<SignIn />} />;
const forgotPassword = () => <AuthLayout content={<ForgotPassword />} />;
const resetPassword = ({ location }) => {
  const parsed = queryString.parse(location.search);
  return <AuthLayout content={<ResetPassword token={parsed.token || ''} />} />;
};

const routes = () => {
  return (
    <Switch>
      <Route path="/forgot-password" exact={true} component={forgotPassword} />
      <Route path="/reset-password" exact={true} component={resetPassword} />
      <Route path="*" component={signIn} />
    </Switch>
  );
};

export default routes;
