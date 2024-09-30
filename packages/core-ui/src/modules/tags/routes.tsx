import { Route, Routes, useLocation, useNavigate } from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";

const List = asyncComponent(
  () => import(/* webpackChunkName: "List - Tags" */ "./containers/List")
);

const Tags = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = queryString.parse(location.search);

  return (
    <List queryParams={queryParams} location={location} navigate={navigate} />
  );
};

const TagRoutes = () => {
  return (
    <Routes>
      <Route path="/settings/tags/" element={<Tags />} />
    </Routes>
  );
};

export default TagRoutes;
