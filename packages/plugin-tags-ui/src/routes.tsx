import { Route, Routes, useLocation } from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";

const List = asyncComponent(
  () => import(/* webpackChunkName: "List - Tags" */ "./containers/List")
);

const Tags = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);

  return <List queryParams={queryParams} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/settings/tags/" element={<Tags />} />
    </Routes>
  );
};

export default routes;
