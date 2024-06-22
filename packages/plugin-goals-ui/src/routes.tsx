import { Route, Routes } from "react-router-dom";

import React from "react";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import { useLocation } from "react-router-dom";

const GoalTypesList = asyncComponent(
  () =>
    import(/* webpackChunkName: "GoalTypesList" */ "./containers/goalTypesList")
);

const GoalTypesLists = () => {
  const location = useLocation();

  return <GoalTypesList queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        key="/erxes-plugin-goalType/goalType"
        path="/erxes-plugin-goalType/goalType"
        element={<GoalTypesLists />}
      />
    </Routes>
  );
};

export default routes;
