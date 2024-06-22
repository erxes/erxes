import { Route, Routes, useLocation } from 'react-router-dom';

import React from 'react';
import asyncComponent from 'modules/common/components/AsyncComponent';
import queryString from 'query-string';

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

const SignInComponent = () => <AuthLayout content={<SignIn />} />;

const ForgotPasswordComponent = () => (
  <AuthLayout content={<ForgotPassword />} />
);

const ResetPasswordComponent = () => {
  const location = useLocation();
  const parsed = queryString.parse(location.search);

  return <AuthLayout content={<ResetPassword token={parsed.token || ''} />} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/forgot-password" element={<ForgotPasswordComponent />} />
      <Route path="/reset-password" element={<ResetPasswordComponent />} />
      <Route path="*" element={<SignInComponent />} />
    </Routes>
  );
};

export default routes;
