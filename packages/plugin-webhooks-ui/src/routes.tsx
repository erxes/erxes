import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

const WebhookList = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Settings - WebhookList" */ "./containers/WebhookList"
    )
);

const Webhook = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  return <WebhookList queryParams={queryParams} />;
};

const routes = () => (
  <Routes>
    <Route path="/settings/webhooks/" element={<Webhook />} />
  </Routes>
);

export default routes;
