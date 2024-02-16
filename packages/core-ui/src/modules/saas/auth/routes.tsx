import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

const AuthLayout = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "AuthLayout" */ '@erxes/ui/src/layout/components/AuthLayout'
    ),
);

const ForgotPassword = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ForgotPassword" */ './containers/ForgotPassword'
    ),
);

const ResetPassword = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ResetPassword" */ './containers/ResetPassword'
    ),
);

const SignIn = asyncComponent(
  () => import(/* webpackChunkName: "SignIn" */ './containers/SignIn'),
);

const SignInWithEmail = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SignInWithEmail" */ './containers/SignInWithEmail'
    ),
);

const signIn = () => <AuthLayout content={<SignIn />} />;

const signInWithEmail = () => <AuthLayout content={<SignInWithEmail />} />;

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
      <Route path="/sign-in" exact={true} component={signIn} />
      <Route path="*" component={signInWithEmail} />
    </Switch>
  );
};

export default routes;
