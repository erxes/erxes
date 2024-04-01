import queryString from "query-string";
import React from "react";
import { Route, Routes } from "react-router-dom";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import { useLocation } from "react-router-dom";

const GoalTypesList = asyncComponent(
  () =>
    import(/* webpackChunkName: "GoalTypesList" */ "./containers/goalTypesList")
);

const GoalTypesLists = () => {
  const location = useLocation();

  return <GoalTypesList queryParams={queryString.parse(location.search)} />;
};

const GoalRoutes = () => {
  return (
    <Routes>
      <Route
        path="/erxes-plugin-goalType/goalType"
        element={<GoalTypesLists />}
      />
    </Routes>
  );
};

export default GoalRoutes;
