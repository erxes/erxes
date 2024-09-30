import { Route, Routes, useLocation } from "react-router-dom";

import React from "react";
import asyncComponent from "modules/common/components/AsyncComponent";
import queryString from "query-string";

const Profile = asyncComponent(
  () =>
    import(/* webpackChunkName: "Settings - Profile" */ "./containers/Profile")
);

const ProfileComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  return <Profile queryParams={queryParams} />;
};

const routes = () => (
  <Routes>
    <Route path="/profile" key="/profile" element={<ProfileComponent />} />
  </Routes>
);

export default routes;
