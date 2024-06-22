import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

const WorkList = asyncComponent(
  () => import(/* webpackChunkName: "WorkList" */ "./containers/WorkList")
);

const WorkListComponent = () => {
  const location = useLocation();
  return <WorkList queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/processes/works"
        key="/processes/works"
        element={<WorkListComponent />}
      />
    </Routes>
  );
};

export default routes;
