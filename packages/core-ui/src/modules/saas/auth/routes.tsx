import asyncComponent from "modules/common/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

const AuthLayout = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "AuthLayout" */ "@erxes/ui/src/layout/components/saas/AuthLayout"
    )
);

const ForgotPassword = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "ForgotPassword" */ "./containers/ForgotPassword"
    )
);

const ResetPassword = asyncComponent(
  () =>
    import(/* webpackChunkName: "ResetPassword" */ "./containers/ResetPassword")
);

const SignIn = asyncComponent(
  () => import(/* webpackChunkName: "SignIn" */ "./containers/SignIn")
);

const SignInWithEmail = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "SignInWithEmail" */ "./containers/SignInWithEmail"
    )
);

const SignInComponent = () => <AuthLayout content={<SignIn />} />;

const SignInWithEmailComponent = () => (
  <AuthLayout content={<SignInWithEmail />} />
);

const ForgotPasswordComponent = () => (
  <AuthLayout content={<ForgotPassword />} />
);

const ResetPasswordComponent = () => {
  const location = useLocation();
  const parsed = queryString.parse(location.search);
  return <AuthLayout content={<ResetPassword token={parsed.token || ""} />} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/forgot-password" element={<ForgotPasswordComponent />} />
      <Route path="/reset-password" element={<ResetPasswordComponent />} />
      <Route path="/sign-in" element={<SignInComponent />} />
      <Route path="*" element={<SignInWithEmailComponent />} />
    </Routes>
  );
};

export default routes;
