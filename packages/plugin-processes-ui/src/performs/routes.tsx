import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

const PerformList = asyncComponent(
  () =>
    import(/* webpackChunkName: "PerformList" */ "../performs/containers/List")
);

const PerformListComponent = () => {
  const location = useLocation();
  return <PerformList queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/processes/performanceList"
        key="/processes/performanceList"
        element={<PerformListComponent />}
      />
    </Routes>
  );
};

export default routes;
