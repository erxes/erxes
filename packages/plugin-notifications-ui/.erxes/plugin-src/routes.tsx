import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route } from "react-router-dom";

const NotificationList = asyncComponent(() =>
  import(
    /* webpackChunkName: "NotificationList"  */ "./containers/NotificationList"
  )
);

const NotificationSettings = asyncComponent(() =>
  import(
    /* webpackChunkName: "NotificationSettings" */ "./containers/NotificationSettings"
  )
);

const notification = ({ location }) => {
  const queryParams = queryString.parse(location.search);
  return <NotificationList queryParams={queryParams} />;
};

const notificationSettings = ({ history, location }) => {
  return (
    <NotificationSettings
      history={history}
      queryParams={queryString.parse(location.search)}
    />
  );
};

const routes = () => {
  return (
    <>
      <Route
        path="/notifications"
        exact={true}
        key="/notifications"
        component={notification}
      />

      <Route
        path="/settings/notifications"
        exact={true}
        key="/settings/notifications"
        component={notificationSettings}
      />
    </>
  );
};

export default routes;
