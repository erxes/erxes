import asyncComponent from '@erxes/ui/src/components/AsyncComponent';
import queryString from 'query-string';
import React from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';

const NotificationList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "NotificationList"  */ './containers/NotificationList'
    )
);

const NotificationSettings = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "NotificationSettings" */ './containers/NotificationSettings'
    )
);

const NotificationCenter = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "NotificationCenter" */ './containers/NotificationCenter'
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

const NotificationCenterComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <NotificationCenter queryParams={queryParams} />;
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
        path="/notifications-center"
        key="/notifications-center"
        element={<NotificationCenterComponent />}
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
