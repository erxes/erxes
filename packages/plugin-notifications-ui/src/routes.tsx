import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

const NotificationList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "NotificationList"  */ "./containers/NotificationList"
    )
);

const NotificationSettings = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "NotificationSettings" */ "./containers/NotificationSettings"
    )
);

const Notification = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  return <NotificationList queryParams={queryParams} />;
};

const NotificationSettingsComponent = () => {
  const location = useLocation();
  return (
    <NotificationSettings queryParams={queryString.parse(location.search)} />
  );
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/notifications"
        key="/notifications"
        element={<Notification />}
      />

      <Route
        path="/settings/notifications"
        key="/settings/notifications"
        element={<NotificationSettingsComponent />}
      />
    </Routes>
  );
};

export default routes;
