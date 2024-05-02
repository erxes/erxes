import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation, useParams } from "react-router-dom";
import Report from "./containers/report/Report";

const List = asyncComponent(
  () => import(/* webpackChunkName: "List - Reportss" */ "./containers/List")
);

const Reports = () => {
  const location = useLocation();
  const queryParams = queryString.parse(location.search);
  const { type } = queryParams;

  return <List typeId={type} queryParams={queryParams} />;
};

const ReportForm = asyncComponent(
  () => import("./containers/report/ReportForm")
);

const ReportsDetail = () => {
  const { slug } = useParams();
  const location = useLocation();

  const queryParams = queryString.parse(location.search);

  const props = { reportId: slug || '', queryParams };

  if (slug === "create-report") {
    return <ReportForm {...props} />;
  }

  return <Report {...props} />;
};

const routes = () => {
  return (
    <Routes>
      <Route path="/reports" element={<Reports />} />

      <Route
        key="/reports/details/:slug"
        path="/reports/details/:slug"
        element={<ReportsDetail />}
      />
    </Routes>
  );
};

export default routes;
