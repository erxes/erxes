import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import asyncComponent from "@erxes/ui/src/components/AsyncComponent";

const Insight = asyncComponent(
  () => import(/* webpackChunkName: "InsightList" */ "./containers/Insight")
);

const InsightList = () => {
  const location = useLocation();

  return <Insight queryParams={queryString.parse(location.search)} />;
};

const InsightRoutes = () => {
  return (
    <Routes>
      <Route path="/insight" element={<InsightList />} />
    </Routes>
  );
};

export default InsightRoutes;
