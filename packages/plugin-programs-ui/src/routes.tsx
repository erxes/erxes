import queryString from "query-string";
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import List from "./containers/List";

const Activities = () => {
  const location = useLocation();

  return <List queryParams={queryString.parse(location.search)} />;
};

const routes = () => {
  return (
    <Routes>
      <Route key="/programs" path="/programs" element={<Activities />} />
    </Routes>
  );
};

export default routes;
