import asyncComponent from "@erxes/ui/src/components/AsyncComponent";
import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";

const List = asyncComponent(
  () =>
    import(/* webpackChunkName: "Processes OverallWorks" */ "./containers/List")
);

const Detail = asyncComponent(
  () =>
    import(
      /* webpackChunkName: "Processes OverallWorkDetail" */ "./containers/Detail"
    )
);

const ListComponent = () => {
  const location = useLocation();
  return <List queryParams={queryString.parse(location.search)} />;
};

const DetailComponent = () => {
  const location = useLocation();
  return <Detail queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route
        path="/processes/overallWorks"
        key="/processes/overallWorks"
        element={<ListComponent />}
      />
      <Route
        path="/processes/overallWorkDetail"
        key="/processes/overallWorkDetail"
        element={<DetailComponent />}
      />
    </Routes>
  );
};

export default routes;
