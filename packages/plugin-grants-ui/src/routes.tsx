import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import queryString from "query-string";

const GrantRequest = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "List - Request" */ "./requests/containers/List"
    )
);

const GrantConfigs = asyncComponent(
  () =>
    import(/* webpackChunkName: "List - Configs" */ "./configs/containers/List")
);

const Requests = () => {
  const location = useLocation();

  return <GrantRequest queryParams={queryString.parse(location.search)} />;
};

const Configs = () => {
  const location = useLocation();

  return <GrantConfigs queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/grants/requests" element={<Requests />} />
      <Route path="/settings/grants-configs" element={<Configs />} />
    </Routes>
  );
};

export default routes;
