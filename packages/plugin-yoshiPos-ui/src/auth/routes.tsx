import asyncComponent from '../common/components/AsyncComponent';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

const AuthLayout = asyncComponent(() =>
  import(/* webpackChunkName: "AuthLayout" */ '../layout/components/AuthLayout')
);

const SignIn = asyncComponent(() =>
  import(/* webpackChunkName: "SignIn" */ './containers/SignIn')
);

const signIn = () => <AuthLayout content={<SignIn />} />;

const routes = () => {
  return (
    <Switch>
      <Route path="*" component={signIn} />
    </Switch>
  );
};

export default routes;
