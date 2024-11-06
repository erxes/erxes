import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import * as React from "react";
import { Route, Routes } from "react-router-dom";
import { useLocation } from "react-router-dom";

const LogList = asyncComponent(
  () => import(/* webpackChunkName: "Settings - Logs" */ "./containers/LogList")
);

const LogListComponent = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <LogList queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/settings/logs/" element={<LogListComponent />} />
    </Routes>
  );
};

export default routes;
