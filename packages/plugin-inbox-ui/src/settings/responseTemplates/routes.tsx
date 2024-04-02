import { Route, Routes, useLocation } from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";

const List = asyncComponent(
  () => import(/* webpackChunkName: "List - Settings" */ "./containers/List")
);

const ResponseTemplates = () => {
  const location = useLocation();

  return (
    <List
      queryParams={queryString.parse(location.search)}
      location={location}
    />
  );
};

const routes = () => (
  <Routes>
    <Route
      path="/settings/response-templates/"
      element={<ResponseTemplates />}
    />
  </Routes>
);

export default routes;
