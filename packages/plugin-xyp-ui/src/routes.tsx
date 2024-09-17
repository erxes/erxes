import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

const List = asyncComponent(
  () => import(/* webpackChunkName: "List" */ './modules/settings/containers/SyncRules')
);

const SettingsComponent = () => {
  const location = useLocation();
  return <List queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route key="/xyp-sync-rules" path="/xyp-sync-rules" element={<SettingsComponent />} />
    </Routes>
  );
};

export default routes;
